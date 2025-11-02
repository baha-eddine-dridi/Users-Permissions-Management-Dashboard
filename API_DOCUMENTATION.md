# 📚 Documentation API - Users Permissions Management

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Format:** JSON  
**Authentification:** Bearer Token (JWT)

---

## 📋 Table des Matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Users Endpoints](#users-endpoints)
5. [Roles Endpoints](#roles-endpoints)
6. [Permissions Endpoints](#permissions-endpoints)
7. [Codes d'Erreur](#codes-derreur)
8. [Modèles de Données](#modèles-de-données)

---

## 🚀 Introduction

Cette API RESTful permet de gérer un système complet de gestion des utilisateurs avec RBAC (Role-Based Access Control).

### Caractéristiques

- ✅ Authentification JWT avec refresh tokens
- ✅ Système RBAC complet (Users, Roles, Permissions)
- ✅ Pagination et recherche
- ✅ Validation avec Zod
- ✅ Rate limiting
- ✅ Vérification email avec codes à 6 chiffres
- ✅ Reset password avec codes à 6 chiffres

### Technologies

- **Backend:** Express.js + TypeScript
- **Database:** MongoDB + Mongoose
- **Validation:** Zod
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer

---

## 🔐 Authentification

### Headers Requis

Pour les endpoints protégés, incluez le token JWT dans le header :

```http
Authorization: Bearer <access_token>
```

### Obtenir un Token

Utilisez l'endpoint `POST /api/auth/login` pour obtenir un token d'accès.

### Refresh Token

Les refresh tokens sont stockés dans des cookies HttpOnly sécurisés. Utilisez `POST /api/auth/refresh` pour obtenir un nouveau access token.

---

## 🔑 Authentication Endpoints

### 1. Register (Inscription)

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation:**
- `email`: Email valide, unique
- `password`: Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
- `firstName`: 1-50 caractères
- `lastName`: 1-50 caractères

**Réponse (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès. Veuillez vérifier votre email.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2024-11-02T10:00:00.000Z"
    }
  }
}
```

**Note:** Un email contenant un code à 6 chiffres est envoyé pour vérification.

---

### 2. Verify Email

Vérifier l'email avec le code à 6 chiffres.

**Endpoint:** `POST /api/auth/verify-email`

**Body:**
```json
{
  "code": "123456"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Email vérifié avec succès"
}
```

**Erreurs:**
- `400`: Code invalide ou expiré
- `404`: Code non trouvé

---

### 3. Login (Connexion)

Se connecter avec email et mot de passe.

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "firstName": "Super",
      "lastName": "Admin",
      "roles": [
        {
          "id": "507f1f77bcf86cd799439012",
          "name": "Super Admin",
          "permissions": ["user.read", "user.create", "..."]
        }
      ],
      "permissions": ["user.read", "user.create", "..."],
      "isActive": true,
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies:**
- `refreshToken`: HttpOnly, Secure, SameSite=Strict, Expire=7j

**Rate Limit:** 5 requêtes / 15 minutes

---

### 4. Forgot Password

Demander un code de réinitialisation de mot de passe.

**Endpoint:** `POST /api/auth/forgot-password`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Code de réinitialisation envoyé par email"
}
```

**Note:** Un email avec un code à 6 chiffres est envoyé (valide 15 minutes).

---

### 5. Reset Password

Réinitialiser le mot de passe avec le code.

**Endpoint:** `POST /api/auth/reset-password`

**Body:**
```json
{
  "code": "123456",
  "password": "NewPassword123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

### 6. Refresh Token

Obtenir un nouveau access token.

**Endpoint:** `POST /api/auth/refresh`

**Cookies Required:** `refreshToken`

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 7. Logout

Se déconnecter et supprimer les cookies.

**Endpoint:** `POST /api/auth/logout`

**Auth:** Bearer Token

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 8. Get Current User

Obtenir les informations de l'utilisateur connecté.

**Endpoint:** `GET /api/auth/me`

**Auth:** Bearer Token

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@example.com",
      "firstName": "Super",
      "lastName": "Admin",
      "roles": [...],
      "permissions": [...],
      "isActive": true,
      "emailVerified": true
    }
  }
}
```

---

## 👥 Users Endpoints

### 1. Get All Users

Récupérer la liste des utilisateurs avec pagination.

**Endpoint:** `GET /api/users`

**Auth:** Bearer Token + Permission `user.read`

**Query Parameters:**
- `page` (number, default: 1): Numéro de page
- `limit` (number, default: 10, max: 100): Items par page
- `search` (string, optional): Recherche par prénom, nom ou email
- `isActive` (boolean, optional): Filtrer par statut actif/inactif
- `sortBy` (string, default: createdAt): Champ de tri (firstName, lastName, email, createdAt)
- `sortOrder` (string, default: desc): Ordre (asc, desc)

**Exemple:**
```http
GET /api/users?page=1&limit=10&search=john&sortBy=firstName&sortOrder=asc
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "roles": [
          {
            "id": "507f1f77bcf86cd799439012",
            "name": "User"
          }
        ],
        "isActive": true,
        "emailVerified": true,
        "createdAt": "2024-11-02T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get User by ID

Récupérer un utilisateur spécifique.

**Endpoint:** `GET /api/users/:id`

**Auth:** Bearer Token + Permission `user.read`

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": [...],
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2024-11-02T10:00:00.000Z",
      "updatedAt": "2024-11-02T10:00:00.000Z"
    }
  }
}
```

---

### 3. Create User

Créer un nouvel utilisateur.

**Endpoint:** `POST /api/users`

**Auth:** Bearer Token + Permission `user.create`

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["507f1f77bcf86cd799439012"]
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439013",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "roles": [...],
      "isActive": true,
      "emailVerified": false
    }
  }
}
```

---

### 4. Update User

Mettre à jour un utilisateur.

**Endpoint:** `PUT /api/users/:id`

**Auth:** Bearer Token + Permission `user.update`

**Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "isActive": true
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Utilisateur mis à jour",
  "data": {
    "user": {...}
  }
}
```

---

### 5. Delete User

Supprimer un utilisateur.

**Endpoint:** `DELETE /api/users/:id`

**Auth:** Bearer Token + Permission `user.delete`

**Réponse (200):**
```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès"
}
```

**Erreur (403):**
```json
{
  "success": false,
  "message": "Vous ne pouvez pas vous supprimer vous-même"
}
```

---

### 6. Toggle User Status

Activer/Désactiver un utilisateur.

**Endpoint:** `PUT /api/users/:id/toggle-status`

**Auth:** Bearer Token + Permission `user.update`

**Réponse (200):**
```json
{
  "success": true,
  "message": "Statut mis à jour",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "isActive": false
    }
  }
}
```

---

### 7. Assign Roles to User

Assigner des rôles à un utilisateur.

**Endpoint:** `PUT /api/users/:id/roles`

**Auth:** Bearer Token + Permission `user.update`

**Body:**
```json
{
  "roleIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Rôles assignés avec succès",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "roles": [...]
    }
  }
}
```

---

## 🛡️ Roles Endpoints

### 1. Get All Roles

**Endpoint:** `GET /api/roles`

**Auth:** Bearer Token + Permission `role.read`

**Query Parameters:**
- `page`, `limit`, `search`, `isActive`, `sortBy`, `sortOrder`

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Admin",
        "description": "Administrateur système",
        "permissions": [
          {
            "id": "507f1f77bcf86cd799439014",
            "name": "user.read",
            "description": "Lire les utilisateurs"
          }
        ],
        "isActive": true,
        "usersCount": 5,
        "permissionsCount": 10,
        "createdAt": "2024-11-02T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2. Create Role

**Endpoint:** `POST /api/roles`

**Auth:** Bearer Token + Permission `role.create`

**Body:**
```json
{
  "name": "Editor",
  "description": "Peut éditer le contenu",
  "permissions": ["user.read", "user.update"]
}
```

**Note:** Le champ `permissions` peut contenir des IDs ou des noms de permissions. Le backend convertit automatiquement.

**Réponse (201):**
```json
{
  "success": true,
  "message": "Rôle créé avec succès",
  "data": {
    "role": {...}
  }
}
```

---

### 3. Update Role

**Endpoint:** `PUT /api/roles/:id`

**Auth:** Bearer Token + Permission `role.update`

**Body:**
```json
{
  "name": "Updated Role",
  "description": "Description mise à jour",
  "permissions": ["user.read", "role.read"],
  "isActive": true
}
```

---

### 4. Delete Role

**Endpoint:** `DELETE /api/roles/:id`

**Auth:** Bearer Token + Permission `role.delete`

**Réponse (200):**
```json
{
  "success": true,
  "message": "Rôle supprimé avec succès"
}
```

---

## 🔓 Permissions Endpoints

### 1. Get All Permissions

**Endpoint:** `GET /api/roles/permissions`

**Auth:** Bearer Token + Permission `permission.read`

**Query Parameters:**
- `page`, `limit`, `search`, `isActive`, `sortBy`, `sortOrder`
- `resource` (string): Filtrer par ressource (user, role, permission, system)
- `action` (string): Filtrer par action (read, create, update, delete)

**Exemple:**
```http
GET /api/roles/permissions?resource=user&action=read
```

**Réponse (200):**
```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "507f1f77bcf86cd799439014",
        "name": "user.read",
        "resource": "user",
        "action": "read",
        "description": "Lire les utilisateurs",
        "isActive": true,
        "createdAt": "2024-11-02T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 2. Create Permission

**Endpoint:** `POST /api/roles/permissions`

**Auth:** Bearer Token + Permission `permission.create`

**Body:**
```json
{
  "name": "product.create",
  "resource": "product",
  "action": "create",
  "description": "Créer des produits"
}
```

**Validation:**
- `name`: Format `resource.action`, unique
- `resource`: 1-30 caractères
- `action`: 1-30 caractères

---

### 3. Update Permission

**Endpoint:** `PUT /api/roles/permissions/:id`

**Auth:** Bearer Token + Permission `permission.update`

---

### 4. Delete Permission

**Endpoint:** `DELETE /api/roles/permissions/:id`

**Auth:** Bearer Token + Permission `permission.delete`

---

## ⚠️ Codes d'Erreur

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Succès |
| 201 | Created | Ressource créée |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Permission refusée |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (email déjà utilisé) |
| 429 | Too Many Requests | Rate limit dépassé |
| 500 | Internal Server Error | Erreur serveur |

**Format d'Erreur:**
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Email déjà utilisé"
    }
  ]
}
```

---

## 📦 Modèles de Données

### User
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string; // Hashé avec bcrypt
  roles: Role[];
  permissions: string[]; // Agrégation de tous les rôles
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Role
```typescript
{
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission
```typescript
{
  id: string;
  name: string; // Format: resource.action
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔒 Sécurité

### Rate Limiting

- **Auth endpoints** (login, register, forgot-password, reset-password): 5 requêtes / 15 minutes
- **General endpoints**: 100 requêtes / 15 minutes

### Password Requirements

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

### JWT Tokens

- **Access Token:** Expire après 15 minutes
- **Refresh Token:** Expire après 7 jours
- **Cookies:** HttpOnly, Secure (production), SameSite=Strict

### Bcrypt

- **Rounds:** 12

---

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement.

**Version:** 1.0.0  
**Dernière mise à jour:** 2 novembre 2024
