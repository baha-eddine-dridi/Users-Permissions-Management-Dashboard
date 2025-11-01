import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt.service';
import { User } from '../models/User';

// Extension du type Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles: string[];
        permissions: string[];
      };
    }
  }
}

/**
 * Middleware d'authentification JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Récupérer le token depuis les headers ou les cookies
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token d\'accès requis',
      });
      return;
    }

    // Vérifier le token
    const decoded = JWTService.verifyAccessToken(token);

    // Récupérer l'utilisateur complet avec ses rôles et permissions
    const user = await User.findById(decoded.userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      })
      .select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou inactif',
      });
      return;
    }

    // Construire la liste des permissions de l'utilisateur
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

    // Ajouter les informations utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map((role: any) => role.name),
      permissions: Array.from(permissions),
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide',
    });
  }
};

/**
 * Middleware d'autorisation basé sur les permissions
 */
export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    if (!req.user.permissions.includes(requiredPermission)) {
      res.status(403).json({
        success: false,
        message: 'Permission insuffisante',
        requiredPermission,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware d'autorisation basé sur les rôles
 */
export const requireRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    if (!req.user.roles.includes(requiredRole)) {
      res.status(403).json({
        success: false,
        message: 'Rôle insuffisant',
        requiredRole,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware d'autorisation pour plusieurs permissions (OR)
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    const hasPermission = permissions.some(permission =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Permission insuffisante',
        requiredPermissions: permissions,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware d'autorisation pour plusieurs permissions (AND)
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    const hasAllPermissions = permissions.every(permission =>
      req.user!.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes',
        requiredPermissions: permissions,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur peut accéder à ses propres données
 */
export const requireOwnershipOrPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentification requise',
      });
      return;
    }

    const userId = req.params.id || req.params.userId;
    const isOwner = req.user.id === userId;
    const hasPermission = req.user.permissions.includes(permission);

    if (!isOwner && !hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé - vous ne pouvez accéder qu\'à vos propres données',
      });
      return;
    }

    next();
  };
};
