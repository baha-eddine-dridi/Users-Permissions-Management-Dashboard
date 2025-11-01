import { z } from 'zod';

// Schémas de validation pour les utilisateurs
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Prénom trop long')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim(),
  roles: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de rôle invalide'))
    .optional(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Prénom trop long')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .trim()
    .optional(),
  roles: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de rôle invalide'))
    .optional(),
  isActive: z.boolean().optional(),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Types TypeScript dérivés des schémas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
