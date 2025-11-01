import { z } from 'zod';

// Schémas de validation pour les rôles
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim(),
  description: z
    .string()
    .max(200, 'Description trop longue')
    .trim()
    .optional(),
  permissions: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de permission invalide'))
    .optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, 'Description trop longue')
    .trim()
    .optional(),
  permissions: z
    .array(z.string()) // Accepter soit des IDs soit des noms de permissions
    .optional(),
  isActive: z.boolean().optional(),
});

export const getRolesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schémas de validation pour les permissions
export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim(),
  resource: z
    .string()
    .min(1, 'La ressource est requise')
    .max(30, 'Ressource trop longue')
    .trim(),
  action: z
    .string()
    .min(1, 'L\'action est requise')
    .max(30, 'Action trop longue')
    .trim(),
  description: z
    .string()
    .max(200, 'Description trop longue')
    .trim()
    .optional(),
});

export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim()
    .optional(),
  resource: z
    .string()
    .min(1, 'La ressource est requise')
    .max(30, 'Ressource trop longue')
    .trim()
    .optional(),
  action: z
    .string()
    .min(1, 'L\'action est requise')
    .max(30, 'Action trop longue')
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, 'Description trop longue')
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
});

export const getPermissionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'resource', 'action', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types TypeScript dérivés des schémas
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type GetRolesQuery = z.infer<typeof getRolesQuerySchema>;
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type GetPermissionsQuery = z.infer<typeof getPermissionsQuerySchema>;
