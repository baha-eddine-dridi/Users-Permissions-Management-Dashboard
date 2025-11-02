import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../schemas/auth.schemas';

const router = Router();

// Rate limiting pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP par fenêtre
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez dans 15 minutes.',
  },
});

// Routes d'authentification avec rate limiting
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

// Routes sans rate limiting strict
router.post('/logout', generalLimiter, logout);
router.post('/refresh-token', generalLimiter, refreshToken);
router.post('/verify-email', generalLimiter, validate(verifyEmailSchema), verifyEmail);

// Routes protégées
router.get('/profile', generalLimiter, authenticateToken, getProfile);

export default router;
