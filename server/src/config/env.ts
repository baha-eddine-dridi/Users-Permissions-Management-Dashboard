import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Configuration centralisée des variables d'environnement
 */
export const config = {
  // Serveur
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de données
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/users-permissions-db',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  jwtExpiration: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Cookies
  cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Email
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  emailService: process.env.EMAIL_SERVICE || 'smtp',
  smtpHost: process.env.EMAIL_HOST || 'localhost',
  smtpPort: Number(process.env.EMAIL_PORT) || 587,
  smtpUser: process.env.EMAIL_USER || '',
  smtpPass: process.env.EMAIL_PASS || '',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Sécurité
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockTime: Number(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000, // 2 heures
  
  // Rate limiting
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
} as const;

/**
 * Validation des variables d'environnement critiques
 */
export function validateConfig(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'COOKIE_SECRET',
  ];
  
  if (config.nodeEnv === 'production') {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variables d'environnement manquantes en production: ${missingVars.join(', ')}`);
    }
  }
}

/**
 * Fonction utilitaire pour vérifier si on est en développement
 */
export const isDevelopment = (): boolean => config.nodeEnv === 'development';

/**
 * Fonction utilitaire pour vérifier si on est en production
 */
export const isProduction = (): boolean => config.nodeEnv === 'production';

/**
 * Fonction utilitaire pour vérifier si on est en test
 */
export const isTest = (): boolean => config.nodeEnv === 'test';
