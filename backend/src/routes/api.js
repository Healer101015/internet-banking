import express from 'express';
import pool from '../config/db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
    loginSchema,
    registerSchema,
    transferSchema,
    passwordSchema,
    generateAccessToken,
    generateRefreshToken,
    hashPassword,
    verifyPassword
} from '../utils/security.js';

const router = express.Router();

// ==========================================
// --- ENDPOINTS DE AUTENTICAÇÃO ---
// ==========================================

router.post('/auth/register', authLimiter, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está em uso' });
        }

        const hashed = await hashPassword(password);

        await conn.beginTransaction();

        // 1. Cria o utilizador
        const [userResult] = await conn.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashed]
        );

        // 2. Cria a conta bancária com saldo inicial de R$ 500,00 (50000 cents)
        await conn.query(
            'INSERT INTO accounts (user_id, balance_cents) VALUES (?, ?)',
            [userResult.insertId, 50000]
        );

        // 3. Envia o Corvo de Boas-vindas
        await conn.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [userResult.insertId, 'Pacto Selado!', 'Bem-vindo ao Reino. O seu cofre recebeu 500 moedas de ouro iniciais.', 'SYSTEM']
        );

        await conn.commit();
        res.status(201).json({ message: 'Conta criada com sucesso! Faça login para continuar.' });
    } catch (e) {
        await conn.rollback();
        if (e.errors) return res.status(400).json({ error: e.errors });
        res.status(500).json({ error: 'Erro ao criar conta' });
    } finally {
        conn.release();
    }
});

router.post('/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await verifyPassword(password, user.password_hash))) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [user.id, refreshHash, expiresAt]);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
        res.status(400).json({ error: e.errors || 'Erro de validação' });
    }
});

router.post('/auth/refresh', authLimiter, async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token não encontrado' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const [tokens] = await pool.query('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()', [refreshHash]);
        if (tokens.length === 0) throw new Error('Token revogado ou inválido');

        await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [tokens[0].id]);

        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);
        const newRefreshHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [decoded.userId, newRefreshHash, expiresAt]);

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ accessToken: newAccessToken });
    } catch (e) {
        res.clearCookie('refreshToken');
        res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }
});

router.post('/auth/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [refreshHash]);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado com sucesso' });
});

// ==========================================
// --- ENDPOINTS DE UTILIZADOR E CONTAS ---
// ==========================================

router.get('/me', requireAuth, async (req, res) => {
    const [users] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    res.json(users[0]);
});

router.get('/accounts/balance', requireAuth, async (req, res) => {
    const [accounts] = await pool.query('SELECT id, balance_cents, currency FROM accounts WHERE user_id = ?', [req.user.id]);
    res.json(accounts[0]);
});

router.post('/me/change-password', requireAuth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = passwordSchema.parse(req.body);
        const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

        if (!(await verifyPassword(oldPassword, users[0].password_hash))) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        const newHash = await hashPassword(newPassword);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

        await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ?', [req.user.id]);
        res.clearCookie('refreshToken');
        res.json({ message: 'Senha alterada. Por favor, faça login novamente.' });
    } catch (e) {
        res.status(400).json({ error: e.errors || 'Erro de validação' });
    }
});

// ==========================================
// --- TRANSAÇÕES E TRANSFERÊNCIAS ---
// ==========================================

router.get('/transactions', requireAuth, async (req, res) => {
    const [accounts] = await pool.query('SELECT id FROM accounts WHERE user_id = ?', [req.user.id]);
    const accountId = accounts[0].id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [transactions] = await pool.query(
        `SELECT * FROM transactions 
         WHERE from_account_id = ? OR to_account_id = ? 
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [accountId, accountId, limit, offset]
    );
    res.json({ data: transactions, page, limit });
});

router.post('/transfers', requireAuth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { toEmail, amountCents, description } = transferSchema.parse(req.body);

        const [destUsers] = await conn.query(
            'SELECT a.id as account_id, u.id as user_id FROM users u JOIN accounts a ON u.id = a.user_id WHERE u.email = ?',
            [toEmail]
        );

        if (destUsers.length === 0) {
            return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail' });
        }

        const toAccountId = destUsers[0].account_id;
        const recipientUserId = destUsers[0].user_id;

        const [myAccounts] = await conn.query('SELECT id FROM accounts WHERE user_id = ?', [req.user.id]);
        const fromAccountId = myAccounts[0].id;

        if (fromAccountId === toAccountId) {
            return res.status(400).json({ error: 'Não é possível transferir para a própria conta' });
        }

        await conn.beginTransaction();

        const ids = [fromAccountId, toAccountId].sort();
        const [lockedAccounts] = await conn.query('SELECT id, balance_cents FROM accounts WHERE id IN (?, ?) FOR UPDATE', ids);

        const fromAccount = lockedAccounts.find(a => a.id === fromAccountId);
        const toAccount = lockedAccounts.find(a => a.id === toAccountId);

        if (fromAccount.balance_cents < amountCents) {
            await conn.rollback();
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        const [dailyTotal] = await conn.query(
            `SELECT COALESCE(SUM(amount_cents), 0) as total FROM transactions 
             WHERE from_account_id = ? AND DATE(created_at) = CURDATE()`, [fromAccountId]
        );

        if (Number(dailyTotal[0].total) + amountCents > 500000) {
            await conn.rollback();
            return res.status(400).json({ error: 'Limite diário de transferências excedido (R$ 5.000,00)' });
        }

        await conn.query('UPDATE accounts SET balance_cents = balance_cents - ? WHERE id = ?', [amountCents, fromAccountId]);
        await conn.query('UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ?', [amountCents, toAccountId]);

        await conn.query(
            'INSERT INTO transactions (from_account_id, to_account_id, amount_cents, description, type) VALUES (?, ?, ?, ?, ?)',
            [fromAccountId, toAccountId, amountCents, description || '', 'TRANSFER']
        );

        // --- SISTEMA DE CORVOS: Envia notificação ao recebedor ---
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amountCents / 100);
        await conn.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [recipientUserId, 'Ouro Recebido!', `Você recebeu ${valorFormatado} de um aliado.`, 'TRANSFER_IN']
        );

        await conn.commit();
        res.json({ message: 'Transferência realizada com sucesso' });
    } catch (e) {
        await conn.rollback();
        if (e.errors) return res.status(400).json({ error: e.errors });
        res.status(500).json({ error: 'Erro interno ao processar transferência' });
    } finally {
        conn.release();
    }
});

// ==========================================
// --- SISTEMAS DE RPG E TAVERNA ---
// ==========================================

router.post('/accounts/tribute', requireAuth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const [accounts] = await conn.query('SELECT id, balance_cents FROM accounts WHERE user_id = ?', [req.user.id]);
        if (accounts.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });

        const accountId = accounts[0].id;

        const [lastTx] = await conn.query(
            `SELECT created_at FROM transactions 
             WHERE to_account_id = ? AND type = 'DEPOSIT' AND description = 'Tributos da Taverna' 
             ORDER BY created_at DESC LIMIT 1`, [accountId]
        );

        if (lastTx.length > 0) {
            const timeDiff = Date.now() - new Date(lastTx[0].created_at).getTime();
            const cooldown = 30 * 60 * 1000; // 30 Minutos

            if (timeDiff < cooldown) {
                const remainingMinutes = Math.ceil((cooldown - timeDiff) / 60000);
                return res.status(429).json({
                    error: `A taverna está sem tarefas. Volte em ${remainingMinutes} minutos.`
                });
            }
        }

        const amountCents = Math.floor(Math.random() * (1500 - 500 + 1) + 500);

        await conn.beginTransaction();

        await conn.query('UPDATE accounts SET balance_cents = balance_cents + ? WHERE id = ?', [amountCents, accountId]);

        await conn.query(
            'INSERT INTO transactions (from_account_id, to_account_id, amount_cents, description, type) VALUES (NULL, ?, ?, ?, ?)',
            [accountId, amountCents, 'Tributos da Taverna', 'DEPOSIT']
        );

        await conn.commit();
        res.json({ message: 'Tributos coletados!', earned_cents: amountCents, new_balance: accounts[0].balance_cents + amountCents });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ error: 'Erro ao coletar tributos' });
    } finally {
        conn.release();
    }
});

router.get('/dashboard/rpg-data', requireAuth, async (req, res) => {
    try {
        const [accounts] = await pool.query('SELECT id FROM accounts WHERE user_id = ?', [req.user.id]);
        const accountId = accounts[0].id;

        let [lair] = await pool.query('SELECT balance_cents FROM investments WHERE account_id = ?', [accountId]);
        if (lair.length === 0) {
            await pool.query('INSERT INTO investments (account_id) VALUES (?)', [accountId]);
            lair = [{ balance_cents: 0 }];
        }

        const [missions] = await pool.query('SELECT * FROM missions WHERE account_id = ?', [accountId]);

        const [guild] = await pool.query(
            `SELECT c.id, u.name, u.email, c.nickname 
             FROM contacts c 
             JOIN users u ON c.contact_user_id = u.id 
             WHERE c.user_id = ?`, [req.user.id]
        );

        res.json({
            lairBalance: lair[0].balance_cents,
            missions: missions,
            guild: guild
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar dados do reino' });
    }
});

// ==========================================
// --- CORVOS MENSAGEIROS (NOTIFICAÇÕES) ---
// ==========================================

router.get('/notifications', requireAuth, async (req, res) => {
    try {
        const [notifs] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 15',
            [req.user.id]
        );
        res.json(notifs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao chamar os corvos.' });
    }
});

router.put('/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Mensagem lida.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao dispensar o corvo.' });
    }
});

router.put('/notifications/read-all', requireAuth, async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.user.id]
        );
        res.json({ message: 'Todos os corvos foram dispensados.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao limpar notificações.' });
    }
});

export default router;