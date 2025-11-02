# 🔧 Configuration du Projet - Users Permissions Management Dashboard

## 📋 Table des Matières
1. [Variables d'Environnement](#variables-denvironnement)
2. [Installation et Démarrage](#installation-et-démarrage)
3. [Seed de la Base de Données](#seed-de-la-base-de-données)
4. [Comptes de Test](#comptes-de-test)

---

## 🌍 Variables d'Environnement

### Backend (.env)

Créez un fichier `.env` dans le dossier `server/` avec le contenu suivant :

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/users-permissions-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookie Settings
COOKIE_SECRET=your-super-secret-cookie-key-change-this-in-production-2024

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=bahadridi441@gmail.com
EMAIL_PASS=your-gmail-app-password-here
EMAIL_FROM=noreply@userspermissions.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

### Frontend (.env)

Créez un fichier `.env` dans le dossier `client/` avec le contenu suivant :

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation et Démarrage

### Prérequis

- **Node.js** v18 ou supérieur
- **MongoDB** v6 ou supérieur (local ou Docker)
- **npm** ou **yarn**

### Étapes d'Installation

#### 1. Cloner le Projet

```bash
cd c:\Users\Lenovo\Desktop\Délivrable
```

#### 2. Installer les Dépendances

```bash
# Installer les dépendances du backend
cd server
npm install

# Installer les dépendances du frontend
cd ../client
npm install
```

#### 3. Configurer MongoDB

**Option A : MongoDB Local**
```bash
# Démarrer MongoDB sur le port par défaut 27017
mongod
```

**Option B : MongoDB avec Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### 4. Créer les Fichiers .env

Créez les fichiers `.env` comme indiqué ci-dessus dans :
- `server/.env`
- `client/.env`

#### 5. Seed de la Base de Données

```bash
cd server
npm run seed
```

#### 6. Démarrer l'Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

#### 7. Accéder à l'Application

Ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

---

## 🌱 Seed de la Base de Données

### Commande de Seed

```bash
cd server
npm run seed
```

### Ce que le Seed Crée

#### 📦 16 Permissions

| Permission | Description |
|------------|-------------|
| `user.read` | Lire les utilisateurs |
| `user.create` | Créer des utilisateurs |
| `user.update` | Modifier des utilisateurs |
| `user.delete` | Supprimer des utilisateurs |
| `role.read` | Lire les rôles |
| `role.create` | Créer des rôles |
| `role.update` | Modifier des rôles |
| `role.delete` | Supprimer des rôles |
| `permission.read` | Lire les permissions |
| `permission.create` | Créer des permissions |
| `permission.update` | Modifier des permissions |
| `permission.delete` | Supprimer des permissions |
| `system.admin` | Accès système administrateur |
| `dashboard.access` | Accès au tableau de bord |
| `reports.view` | Voir les rapports |
| `audit.view` | Voir les logs d'audit |

#### 👥 4 Rôles

| Rôle | Nombre de Permissions | Description |
|------|----------------------|-------------|
| **Super Admin** | 16/16 | Administrateur système avec tous les droits |
| **Admin** | 11/16 | Administrateur avec la plupart des droits (sauf gestion permissions) |
| **Manager** | 5/16 | Gestionnaire avec droits limités (lecture users/roles + dashboard) |
| **User** | 1/16 | Utilisateur standard (accès dashboard uniquement) |

#### 🧑‍💻 5 Utilisateurs de Test

| Email | Mot de passe | Rôle | Email Vérifié |
|-------|--------------|------|---------------|
| `admin@example.com` | `Admin123!` | Super Admin | ✅ |
| `manager@example.com` | `Manager123!` | Admin | ✅ |
| `user@example.com` | `User123!` | User | ✅ |
| `alice@example.com` | `Alice123!` | Manager | ✅ |
| `bob@example.com` | `Bob123!` | User | ✅ |

---

## 🔑 Comptes de Test

### Super Admin (Tous les Droits)
- **Email:** `admin@example.com`
- **Mot de passe:** `Admin123!`
- **Permissions:** 16/16
- **Accès:**
  - ✅ Gestion complète des utilisateurs
  - ✅ Gestion complète des rôles
  - ✅ Gestion complète des permissions
  - ✅ Dashboard avec toutes les statistiques

### Admin (Droits Élevés)
- **Email:** `manager@example.com`
- **Mot de passe:** `Manager123!`
- **Permissions:** 11/16
- **Accès:**
  - ✅ Gestion complète des utilisateurs
  - ✅ Gestion complète des rôles
  - ❌ Gestion des permissions (lecture seule)
  - ✅ Dashboard avec statistiques

### User (Droits Limités)
- **Email:** `user@example.com`
- **Mot de passe:** `User123!`
- **Permissions:** 1/16
- **Accès:**
  - ❌ Gestion des utilisateurs
  - ❌ Gestion des rôles
  - ❌ Gestion des permissions
  - ✅ Dashboard (accès basique)

### Manager (Droits Moyens)
- **Email:** `alice@example.com`
- **Mot de passe:** `Alice123!`
- **Permissions:** 5/16
- **Accès:**
  - ✅ Lecture des utilisateurs
  - ✅ Lecture des rôles
  - ❌ Création/Modification/Suppression
  - ✅ Dashboard avec statistiques

### User Basique
- **Email:** `bob@example.com`
- **Mot de passe:** `Bob123!`
- **Permissions:** 1/16
- **Accès:**
  - ❌ Gestion des utilisateurs
  - ❌ Gestion des rôles
  - ❌ Gestion des permissions
  - ✅ Dashboard (accès basique)

---

## 🔐 Configuration Email (Gmail)

Pour activer l'envoi d'emails (vérification email, reset password) :

### 1. Activer l'Authentification à Deux Facteurs (2FA)

1. Allez sur https://myaccount.google.com/security
2. Activez "Validation en deux étapes"

### 2. Créer un Mot de Passe d'Application

1. Allez sur https://myaccount.google.com/apppasswords
2. Sélectionnez "Autre (nom personnalisé)"
3. Entrez "Users Permissions App"
4. Cliquez sur "Générer"
5. Copiez le mot de passe de 16 caractères

### 3. Mettre à Jour le Fichier .env

```env
EMAIL_USER=bahadridi441@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application généré
```

---

## 🧪 Test de l'Application

### 1. Tester l'Authentification

```bash
# Se connecter avec le compte Super Admin
Email: admin@example.com
Mot de passe: Admin123!
```

### 2. Tester les Permissions

- Connectez-vous avec différents comptes pour voir les différences de permissions
- Le compte `user@example.com` ne verra que le dashboard
- Le compte `admin@example.com` verra tout

### 3. Tester la Création d'Utilisateur

1. Connectez-vous avec `admin@example.com`
2. Allez dans "Utilisateurs"
3. Cliquez sur "Créer un utilisateur"
4. Remplissez le formulaire
5. L'utilisateur recevra un email avec un code de vérification à 6 chiffres

### 4. Tester le Reset de Mot de Passe

1. Sur la page de connexion, cliquez sur "Mot de passe oublié ?"
2. Entrez un email (ex: `admin@example.com`)
3. Vous recevrez un email avec un code à 6 chiffres
4. Entrez le code et choisissez un nouveau mot de passe

---

## 📊 Vérification de la Base de Données

### Avec MongoDB Compass

1. Téléchargez MongoDB Compass : https://www.mongodb.com/products/compass
2. Connectez-vous à : `mongodb://localhost:27017`
3. Sélectionnez la base `users-permissions-db`
4. Vous devriez voir 3 collections :
   - `users` (5 documents)
   - `roles` (4 documents)
   - `permissions` (16 documents)

### Avec MongoDB Shell

```bash
# Se connecter à MongoDB
mongosh

# Utiliser la base de données
use users-permissions-db

# Compter les documents
db.users.countDocuments()      # Devrait retourner 5
db.roles.countDocuments()      # Devrait retourner 4
db.permissions.countDocuments() # Devrait retourner 16

# Voir les utilisateurs
db.users.find().pretty()

# Voir les rôles avec leurs permissions
db.roles.find().pretty()
```

---

## 🐛 Dépannage

### Problème : MongoDB ne démarre pas

**Solution:**
```bash
# Vérifier si MongoDB est installé
mongod --version

# Ou utiliser Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Problème : Port 5000 déjà utilisé

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou changez le port dans server/.env
PORT=5001
```

### Problème : Emails non reçus

**Solution:**
1. Vérifiez que Gmail 2FA est activé
2. Vérifiez le mot de passe d'application
3. Vérifiez les logs du serveur pour les erreurs d'email
4. Vérifiez le dossier spam

### Problème : Erreur de connexion à la base de données

**Solution:**
```bash
# Vérifier que MongoDB est démarré
docker ps | findstr mongo

# Redémarrer MongoDB
docker restart mongodb
```

---

## 📝 Notes Importantes

1. **Sécurité:** Les secrets dans `.env` doivent être changés en production
2. **Email:** Configurez un vrai service SMTP pour la production (SendGrid, AWS SES, etc.)
3. **Base de Données:** Utilisez MongoDB Atlas pour la production
4. **CORS:** Mettez à jour `CORS_ORIGIN` avec votre domaine en production
5. **Rate Limiting:** Ajustez les limites selon vos besoins

---

## 🎯 Prochaines Étapes

1. ✅ Installer les dépendances
2. ✅ Configurer les fichiers `.env`
3. ✅ Démarrer MongoDB
4. ✅ Lancer le seed
5. ✅ Démarrer le backend
6. ✅ Démarrer le frontend
7. ✅ Se connecter avec un compte de test
8. ✅ Explorer l'application !

---

**Bon développement ! 🚀**
