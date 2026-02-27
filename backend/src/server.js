import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();

// Segurança e Middlewares Básicos
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true // Necessário para enviar cookies httpOnly
}));
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);

// Rotas
app.use('/api', apiRoutes);

// Error handling global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado no servidor!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Back-end rodando na porta ${PORT}`);
});