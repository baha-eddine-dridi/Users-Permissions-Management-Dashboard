import { Request, Response } from 'express';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { JWTService } from '../utils/jwt.service';
import { EmailService } from '../utils/email.service';
import { isDevelopment } from '../config/env';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth.schemas';

/**
 * Contrôleur pour l'inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName }: RegisterInput = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      });
      return;
    }

    // Récupérer le rôle "User" par défaut
    const defaultRole = await Role.findOne({ name: 'User' });
    if (!defaultRole) {
      res.status(500).json({
        success: false,
        message: 'Rôle par défaut non trouvé',
      });
      return;
    }

    // Générer un token de vérification d'email
    const emailVerificationToken = JWTService.generateSecureToken();

    // Créer le nouvel utilisateur
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      roles: [defaultRole._id],
      emailVerificationToken,
    });

    await user.save();

    // Envoyer l'email de vérification (stub en développement)
    try {
      if (isDevelopment()) {
        await EmailService.sendEmailStub({
          to: email,
          subject: 'Vérifiez votre adresse email',
          text: `Token de vérification: ${emailVerificationToken}`,
        });
      } else {
        await EmailService.sendVerificationEmail(email, emailVerificationToken, firstName);
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès. Vérifiez votre email.',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour la connexion d'un utilisateur
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginInput = req.body;

    // Trouver l'utilisateur et charger ses rôles
    const user = await User.findOne({ email })
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier si le compte est verrouillé
    if (user.isLocked()) {
      res.status(423).json({
        success: false,
        message: 'Compte temporairement verrouillé en raison de trop nombreuses tentatives de connexion',
      });
      return;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrémenter les tentatives de connexion échouées
      await user.incLoginAttempts();
      
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
      return;
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Compte désactivé',
      });
      return;
    }

    // Réinitialiser les tentatives de connexion en cas de succès
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // Générer les tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair(
      user.id,
      user.email
    );

    // Construire la liste des permissions
    const permissions = new Set<string>();
    user.roles.forEach((role: any) => {
      if (role.isActive) {
        role.permissions.forEach((permission: any) => {
          if (permission.isActive) {
            permissions.add(permission.name);
          }
        });
      }
    });

    // Configurer les cookies sécurisés
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map((role: any) => role.name),
          permissions: Array.from(permissions),
          lastLogin: user.lastLogin,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour la déconnexion
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Supprimer les cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour le rafraîchissement du token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Récupérer le refresh token
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token requis',
      });
      return;
    }

    // Vérifier le refresh token
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif',
      });
      return;
    }

    // Générer un nouveau token d'accès
    const newAccessToken = JWTService.generateAccessToken(user.id, user.email);

    // Configurer le cookie sécurisé
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token invalide',
    });
  }
};

/**
 * Contrôleur pour la demande de réinitialisation de mot de passe
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email }: ForgotPasswordInput = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Ne pas révéler si l'email existe ou non
      res.status(200).json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      });
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = JWTService.generateSecureToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Envoyer l'email de réinitialisation
    try {
      if (process.env.NODE_ENV === 'development') {
        await EmailService.sendEmailStub({
          to: email,
          subject: 'Réinitialisation de mot de passe',
          text: `Token de réinitialisation: ${resetToken}`,
        });
      } else {
        await EmailService.sendPasswordResetEmail(email, resetToken, user.firstName);
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour la réinitialisation du mot de passe
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password }: ResetPasswordInput = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré',
      });
      return;
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour vérifier l'email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Token de vérification invalide',
      });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la vérification d\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};

/**
 * Contrôleur pour obtenir le profil de l'utilisateur connecté
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
      return;
    }

    const user = await User.findById(req.user.id)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      })
      .select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
};
