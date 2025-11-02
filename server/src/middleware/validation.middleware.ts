import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware de validation avec Zod
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Valider le body de la requête
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Données de validation invalides',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur de validation interne',
      });
    }
  };
};

/**
 * Middleware de validation pour les paramètres de query
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Utiliser safeParse pour gérer les valeurs par défaut correctement
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: 'Paramètres de requête invalides',
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      
      // Assigner les valeurs validées et avec les defaults appliqués
      req.query = result.data as any;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur de validation interne',
      });
    }
  };
};

/**
 * Middleware de validation pour les paramètres d'URL
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Valider les paramètres d'URL
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Paramètres d\'URL invalides',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur de validation interne',
      });
    }
  };
};
