import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Zod Schemas
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

export const transferSchema = z.object({
    toAccountId: z.number().int().positive(),
    amountCents: z.number().int().positive().max(200000, "Limite por transferência é de R$ 2.000,00"),
    description: z.string().max(255).optional()
});

export const passwordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres")
});