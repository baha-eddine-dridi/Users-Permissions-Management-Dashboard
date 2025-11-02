import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class JWTService {
  /**
   * Génère un token d'accès JWT
   */
  static generateAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      type: 'access',
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiration,
      issuer: 'users-permissions-api',
      audience: 'users-permissions-client',
    } as any);
  }

  /**
   * Génère un refresh token JWT
   */
  static generateRefreshToken(userId: string, email: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiration,
      issuer: 'users-permissions-api',
      audience: 'users-permissions-client',
    } as any);
  }

  /**
   * Vérifie et décode un token d'accès
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'users-permissions-api',
        audience: 'users-permissions-client',
      }) as TokenPayload;

      if (decoded.type !== 'access') {
        throw new Error('Token type invalide');
      }

      return decoded;
    } catch (error) {
      throw new Error('Token d\'accès invalide');
    }
  }

  /**
   * Vérifie et décode un refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret, {
        issuer: 'users-permissions-api',
        audience: 'users-permissions-client',
      }) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Token type invalide');
      }

      return decoded;
    } catch (error) {
      throw new Error('Refresh token invalide');
    }
  }

  /**
   * Génère un token sécurisé pour la réinitialisation de mot de passe
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Génère un code de vérification à 6 chiffres
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Génère les deux tokens (access + refresh)
   */
  static generateTokenPair(userId: string, email: string) {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }
}
