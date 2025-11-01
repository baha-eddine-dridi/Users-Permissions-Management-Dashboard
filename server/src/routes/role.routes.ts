import { Router } from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  attachPermissions,
  getPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from '../controllers/role.controller';
import { validate, validateQuery, validateParams } from '../middleware/validation.middleware';
import { authenticateToken, requirePermission } from '../middleware/auth.middleware';
import {
  createRoleSchema,
  updateRoleSchema,
  getRolesQuerySchema,
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionsQuerySchema,
} from '../schemas/role.schemas';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour les paramètres d'ID
const idParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID invalide'),
});

// Schéma pour l'attachement de permissions
const attachPermissionsSchema = z.object({
  permissionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de permission invalide')),
});

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// ==================== ROUTES POUR LES RÔLES ====================

// GET /api/roles - Obtenir la liste des rôles (avec pagination)
router.get(
  '/',
  requirePermission('role.read'),
  validateQuery(getRolesQuerySchema),
  getRoles
);

// GET /api/roles/:id - Obtenir un rôle par ID
router.get(
  '/:id',
  requirePermission('role.read'),
  validateParams(idParamsSchema),
  getRoleById
);

// POST /api/roles - Créer un nouveau rôle
router.post(
  '/',
  requirePermission('role.create'),
  validate(createRoleSchema),
  createRole
);

// PUT /api/roles/:id - Mettre à jour un rôle
router.put(
  '/:id',
  requirePermission('role.update'),
  validateParams(idParamsSchema),
  validate(updateRoleSchema),
  updateRole
);

// DELETE /api/roles/:id - Supprimer un rôle
router.delete(
  '/:id',
  requirePermission('role.delete'),
  validateParams(idParamsSchema),
  deleteRole
);

// POST /api/roles/:id/attach-permissions - Attacher des permissions à un rôle
router.post(
  '/:id/attach-permissions',
  requirePermission('role.update'),
  validateParams(idParamsSchema),
  validate(attachPermissionsSchema),
  attachPermissions
);

// ==================== ROUTES POUR LES PERMISSIONS ====================

// GET /api/permissions - Obtenir la liste des permissions (avec pagination)
router.get(
  '/permissions',
  requirePermission('permission.read'),
  validateQuery(getPermissionsQuerySchema),
  getPermissions
);

// GET /api/permissions/:id - Obtenir une permission par ID
router.get(
  '/permissions/:id',
  requirePermission('permission.read'),
  validateParams(idParamsSchema),
  getPermissionById
);

// POST /api/permissions - Créer une nouvelle permission
router.post(
  '/permissions',
  requirePermission('permission.create'),
  validate(createPermissionSchema),
  createPermission
);

// PUT /api/permissions/:id - Mettre à jour une permission
router.put(
  '/permissions/:id',
  requirePermission('permission.update'),
  validateParams(idParamsSchema),
  validate(updatePermissionSchema),
  updatePermission
);

// DELETE /api/permissions/:id - Supprimer une permission
router.delete(
  '/permissions/:id',
  requirePermission('permission.delete'),
  validateParams(idParamsSchema),
  deletePermission
);

export default router;
