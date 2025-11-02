import { z } from 'zod';

// Schémas de validation pour l'authentification
export const registerSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
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
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .max(255, 'Email trop long'),
});

export const resetPasswordSchema = z.object({
  code: z.string().length(6, 'Le code doit contenir exactement 6 chiffres'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, 'Le code doit contenir exactement 6 chiffres'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
});

// Types TypeScript dérivés des schémas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
