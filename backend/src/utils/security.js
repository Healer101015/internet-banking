import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export const generateAccessToken = (userId) => jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
export const generateRefreshToken = (userId) => jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// --- NOVOS SCHEMAS ---
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

// NOVO: Schema para criação de conta
export const registerSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

// ATUALIZADO: Trocamos toAccountId por toEmail
export const transferSchema = z.object({
    toEmail: z.string().email("E-mail inválido"),
    amountCents: z.number().int().positive().max(200000, "Limite por transferência é de R$ 2.000,00"),
    description: z.string().max(255).optional()
});

export const passwordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres")
});