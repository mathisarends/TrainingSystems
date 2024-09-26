import rateLimit from 'express-rate-limit'; // Rate Limiting importieren

const isDevelopment = process.env.NODE_ENV === 'development';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 150,
  message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es in 15 Minuten erneut.'
});

export default limiter;
