import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Aumentado de 10 para 100 tentativas
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 200, // Aumentado de 60 para 200 requisições por minuto
});