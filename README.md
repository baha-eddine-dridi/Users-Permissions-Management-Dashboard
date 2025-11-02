# 🎯 Users & Permissions Management Dashboard

Une application Full-Stack TypeScript moderne pour la gestion des utilisateurs, rôles et permissions avec un système RBAC (Role-Based Access Control) complet et sécurisé.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248.svg)](https://www.mongodb.com/)

---

## 🚀 Stack Technique

### Frontend
- **React 18** + **TypeScript** - Framework UI moderne avec typage statique
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utility-first
- **Zustand** - State management léger
- **React Query** - Gestion des données serveur
- **React Hook Form** - Gestion des formulaires

### Backend
- **Express.js** + **TypeScript** - Framework web Node.js
- **MongoDB** + **Mongoose** - Base de données NoSQL
- **JWT** - Authentification par tokens
- **Zod** - Validation de schémas
- **bcrypt** - Hashage des mots de passe

### DevOps & Sécurité
- **Docker** + **Docker Compose** - Containerisation
- **Rate Limiting** - Protection contre les abus
- **Helmet** - Headers de sécurité HTTP
- **CORS** - Gestion cross-origin

---

## 📁 Structure du Projet

```
├── client/                # Application React TypeScript
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── stores/       # État global (Zustand)
│
├── server/                # API Express.js TypeScript
│   ├── src/
│   │   ├── controllers/  # Logique métier
│   │   ├── middleware/   # Auth, validation
│   │   ├── models/       # Modèles MongoDB
│   │   ├── routes/       # Routes Express
│   │   └── schemas/      # Schémas Zod
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Installation & Démarrage

### Prérequis
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** & **Docker Compose** (optionnel)

### Installation

```bash
# Cloner le repository
git clone https://github.com/baha-eddine-dridi/Users-Permissions-Management-Dashboard.git
cd Users-Permissions-Management-Dashboard

# Installer toutes les dépendances
npm install
```

### Configuration

```bash
# Copier les fichiers d'environnement
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Configurer les variables dans `server/.env` et `client/.env`

### Démarrage

#### Option 1: Avec Docker (Recommandé) 🐳

```bash
npm run docker:up
```

#### Option 2: Manuel

```bash
# Terminal 1 - MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Terminal 2 - Backend + Frontend
npm run dev
```

### Seed de la Base de Données

```bash
npm run seed
```

---

## 🔐 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Super Admin** | admin@example.com | Admin123! |
| **Manager** | manager@example.com | Manager123! |
| **User** | user@example.com | User123! |

---

## 📚 Fonctionnalités

### ✅ Authentification
- Inscription / Connexion / Déconnexion
- Refresh tokens automatiques
- Hashage des mots de passe (bcrypt)
- Reset de mot de passe
- Vérification email

### ✅ RBAC (Role-Based Access Control)
- **Utilisateurs** : CRUD complet, recherche, tri, pagination
- **Rôles** : CRUD, attribution de permissions
- **Permissions** : Système granulaire (`resource.action`)
- Protection routes frontend/backend
- Guards et middlewares

### ✅ Sécurité
- Rate limiting sur les routes d'auth
- Validation Zod sur toutes les entrées
- Cookies sécurisés / Headers JWT
- Protection CORS et Helmet

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Démarre frontend + backend
npm run build        # Build production
npm run start        # Démarre en production
npm run seed         # Populate la base de données
npm run docker:up    # Démarre avec Docker
npm run docker:down  # Arrête Docker
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints Principaux

#### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `GET /auth/me` - Profil utilisateur

#### Utilisateurs
- `GET /users` - Liste (permission: `user.read`)
- `GET /users/:id` - Détails
- `POST /users` - Créer (permission: `user.create`)
- `PUT /users/:id` - Modifier (permission: `user.update`)
- `DELETE /users/:id` - Supprimer (permission: `user.delete`)

#### Rôles
- `GET /roles` - Liste (permission: `role.read`)
- `POST /roles` - Créer (permission: `role.create`)
- `PUT /roles/:id` - Modifier (permission: `role.update`)
- `DELETE /roles/:id` - Supprimer (permission: `role.delete`)

#### Permissions
- `GET /roles/permissions` - Liste (permission: `permission.read`)
- `POST /roles/permissions` - Créer (permission: `permission.create`)

---

## 📊 Modèle de Données

### User (Utilisateur)
```typescript
{
  email: string (unique, required)
  password: string (hashed)
  firstName: string
  lastName: string
  roles: ObjectId[] (ref: Role)
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Role (Rôle)
```typescript
{
  name: string (unique, required)
  description: string
  permissions: ObjectId[] (ref: Permission)
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Permission
```typescript
{
  name: string (unique) // format: "resource.action"
  resource: string      // ex: "user", "role"
  action: string        // ex: "read", "create"
  description: string
  createdAt: Date
  updatedAt: Date
}
```

---

## 🎯 Matrix Rôles/Permissions

| Permission | Super Admin | Admin | Manager | User |
|------------|:-----------:|:-----:|:-------:|:----:|
| `user.read` | ✅ | ✅ | ✅ | ❌ |
| `user.create` | ✅ | ✅ | ❌ | ❌ |
| `user.update` | ✅ | ✅ | ✅ | ❌ |
| `user.delete` | ✅ | ✅ | ❌ | ❌ |
| `role.read` | ✅ | ✅ | ❌ | ❌ |
| `role.create` | ✅ | ❌ | ❌ | ❌ |
| `role.update` | ✅ | ❌ | ❌ | ❌ |
| `role.delete` | ✅ | ❌ | ❌ | ❌ |
| `permission.*` | ✅ | ❌ | ❌ | ❌ |

---

## 🐳 Docker

### Développement
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🚀 Déploiement

### 1. Build de Production
```bash
npm run build
```

### 2. Configuration Production
Créer `.env.production` avec :
- `NODE_ENV=production`
- Secrets JWT sécurisés
- MongoDB Atlas ou instance dédiée
- CORS configuré pour le domaine de production

### 3. Déploiement Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🧪 Tests

```bash
# Backend
cd server && npm test

# Frontend
cd client && npm test
```

---

## 🔒 Sécurité

### Mesures Implémentées
- ✅ Hashage bcrypt (salt rounds: 12)
- ✅ JWT Access + Refresh tokens
- ✅ Rate limiting anti-brute force
- ✅ CORS validation des origines
- ✅ Helmet.js headers de sécurité
- ✅ Validation Zod de toutes les entrées
- ✅ Cookies HttpOnly (protection XSS)

### Recommandations Production
```bash
# Générer des secrets forts
openssl rand -hex 64

# Audit des dépendances
npm audit
npm audit fix
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout fonctionnalité'`)
4. Push sur la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

---

## 📝 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Baha Eddine Dridi**

- GitHub: [@baha-eddine-dridi](https://github.com/baha-eddine-dridi)
- Repository: [Users-Permissions-Management-Dashboard](https://github.com/baha-eddine-dridi/Users-Permissions-Management-Dashboard)

---

<div align="center">

**Développé avec ❤️ et TypeScript**

⭐️ Si ce projet vous aide, n'hésitez pas à mettre une étoile !

</div>
