import express from 'express';
import pool from '../config/db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
// ATENÇÃO: registerSchema adicionado aqui na importação
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

// --- AUTH ENDPOINTS ---

// NOVO: Rota de Registro
router.post('/auth/register', authLimiter, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { name, email, password } = registerSchema.parse(req.body);

        // Verifica se o email já existe
        const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Este e-mail já está em uso' });
        }

        const hashed = await hashPassword(password);

        await conn.beginTransaction();

        // 1. Cria o usuário
        const [userResult] = await conn.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name, email, hashed]
        );

        // 2. Cria a conta bancária para o usuário com saldo inicial de R$ 500,00 (50000 cents)
        await conn.query(
            'INSERT INTO accounts (user_id, balance_cents) VALUES (?, ?)',
            [userResult.insertId, 50000]
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
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
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

// --- USER & ACCOUNTS ENDPOINTS ---
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

// --- TRANSACTIONS & TRANSFERS ENDPOINTS ---
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

// ATUALIZADO: Rota de Transferência (agora usando toEmail)
router.post('/transfers', requireAuth, async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { toEmail, amountCents, description } = transferSchema.parse(req.body);

        // Busca a conta de destino pelo e-mail
        const [destUsers] = await conn.query(
            'SELECT a.id as account_id FROM users u JOIN accounts a ON u.id = a.user_id WHERE u.email = ?',
            [toEmail]
        );

        if (destUsers.length === 0) {
            return res.status(404).json({ error: 'Nenhuma conta encontrada com este e-mail' });
        }

        const toAccountId = destUsers[0].account_id;

        const [myAccounts] = await conn.query('SELECT id FROM accounts WHERE user_id = ?', [req.user.id]);
        const fromAccountId = myAccounts[0].id;

        if (fromAccountId === toAccountId) {
            return res.status(400).json({ error: 'Não é possível transferir para a própria conta' });
        }

        await conn.beginTransaction();

        // Lock das linhas envolvidas
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

export default router;