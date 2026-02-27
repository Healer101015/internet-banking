import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function getConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });
}

async function runMigrations() {
    const conn = await getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    await conn.query(`USE ${process.env.DB_NAME}`);

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Executando migrations...');
    await conn.query(schemaSql);
    console.log('Tabelas criadas com sucesso!');
    await conn.end();
}

async function runSeed() {
    const conn = await getConnection();
    await conn.query(`USE ${process.env.DB_NAME}`);

    console.log('Limpando dados antigos...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE refresh_tokens; TRUNCATE TABLE transactions; TRUNCATE TABLE accounts; TRUNCATE TABLE users;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const hash = await bcrypt.hash('SenhaForte123!', 12);

    // Inserindo dados base para testes
    console.log('Inserindo usuários...');
    const [user1] = await conn.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['João Henrique (Healer)', 'healer@bank.com', hash]);
    const [user2] = await conn.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', ['Maria Silva', 'maria@bank.com', hash]);

    console.log('Criando contas e saldos...');
    // 500.000 centavos = R$ 5.000,00
    await conn.query('INSERT INTO accounts (user_id, balance_cents) VALUES (?, ?)', [user1.insertId, 500000]);
    // 100.000 centavos = R$ 1.000,00
    await conn.query('INSERT INTO accounts (user_id, balance_cents) VALUES (?, ?)', [user2.insertId, 100000]);

    console.log('Seed finalizado! Credenciais de teste:');
    console.log('Email: healer@bank.com | Senha: SenhaForte123!');
    console.log('Email: maria@bank.com | Senha: SenhaForte123!');
    await conn.end();
}

const action = process.argv[2];
if (action === 'migrate') runMigrations().then(() => process.exit(0)).catch(console.error);
else if (action === 'seed') runSeed().then(() => process.exit(0)).catch(console.error);
else console.log('Use "npm run migrate" ou "npm run seed"');