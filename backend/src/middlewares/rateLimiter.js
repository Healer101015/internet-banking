import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limite de 10 tentativas de login/refresh por IP
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // 60 requisições por minuto
});