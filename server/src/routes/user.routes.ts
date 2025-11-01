import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  assignRoles,
} from '../controllers/user.controller';
import { validate, validateQuery, validateParams } from '../middleware/validation.middleware';
import { authenticateToken, requirePermission } from '../middleware/auth.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUsersQuerySchema,
} from '../schemas/user.schemas';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour les paramètres d'ID
const idParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
});

// Schéma pour l'assignation de rôles
const assignRolesSchema = z.object({
  roleIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de rôle invalide')),
});

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/users - Obtenir la liste des utilisateurs (avec pagination)
router.get(
  '/',
  requirePermission('user.read'),
  validateQuery(getUsersQuerySchema),
  getUsers
);

// GET /api/users/:id - Obtenir un utilisateur par ID
router.get(
  '/:id',
  requirePermission('user.read'),
  validateParams(idParamsSchema),
  getUserById
);

// POST /api/users - Créer un nouvel utilisateur
router.post(
  '/',
  requirePermission('user.create'),
  validate(createUserSchema),
  createUser
);

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put(
  '/:id',
  requirePermission('user.update'),
  validateParams(idParamsSchema),
  validate(updateUserSchema),
  updateUser
);

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete(
  '/:id',
  requirePermission('user.delete'),
  validateParams(idParamsSchema),
  deleteUser
);

// PATCH /api/users/:id/toggle-status - Activer/désactiver un utilisateur
router.patch(
  '/:id/toggle-status',
  requirePermission('user.update'),
  validateParams(idParamsSchema),
  toggleUserStatus
);

// POST /api/users/:id/assign-roles - Assigner des rôles à un utilisateur
router.post(
  '/:id/assign-roles',
  requirePermission('user.update'),
  validateParams(idParamsSchema),
  validate(assignRolesSchema),
  assignRoles
);

export default router;
