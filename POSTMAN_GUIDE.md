# 📮 Guide d'Utilisation de la Collection Postman

## 🚀 Importation de la Collection

### Méthode 1 : Import depuis le fichier

1. Ouvrez **Postman**
2. Cliquez sur **Import** (en haut à gauche)
3. Sélectionnez **Upload Files**
4. Choisissez le fichier `API_DOCUMENTATION.postman_collection.json`
5. Cliquez sur **Import**

### Méthode 2 : Import par glisser-déposer

1. Ouvrez **Postman**
2. Faites glisser le fichier `API_DOCUMENTATION.postman_collection.json` dans la fenêtre Postman
3. La collection sera automatiquement importée

---

## ⚙️ Configuration de l'Environnement

### Variables de Collection

Après l'import, deux variables sont automatiquement configurées :

1. **baseUrl** : `http://localhost:5000/api`
   - URL de base de l'API
   - Modifiez si votre serveur tourne sur un autre port

2. **accessToken** : `` (vide au départ)
   - Token JWT automatiquement sauvegardé après login
   - Utilisé pour authentifier les requêtes protégées

### Modifier les Variables

1. Cliquez sur la collection **Users Permissions Management API**
2. Allez dans l'onglet **Variables**
3. Modifiez les valeurs si nécessaire
4. Cliquez sur **Save**

---

## 🔑 Workflow d'Authentification

### 1. Se Connecter (Login)

1. Ouvrez la requête **Authentication > Login**
2. Vérifiez le body :
   ```json
   {
     "email": "admin@example.com",
     "password": "Admin123!"
   }
   ```
3. Cliquez sur **Send**
4. Le **accessToken** sera **automatiquement sauvegardé** dans les variables de collection
5. Toutes les requêtes suivantes utiliseront automatiquement ce token

### 2. Vérifier le Token Sauvegardé

1. Allez dans **Variables** de la collection
2. Vous verrez `accessToken` avec une valeur commençant par `eyJhbG...`
3. Ce token est valide pendant **15 minutes**

### 3. Refresh Token (si expiré)

1. Si vous obtenez une erreur `401 Unauthorized`
2. Ouvrez **Authentication > Refresh Token**
3. Cliquez sur **Send**
4. Un nouveau token sera généré et sauvegardé automatiquement

---

## 📝 Utilisation des Endpoints

### Endpoints Publics (sans authentification)

Ces endpoints ne nécessitent pas de token :

- `POST /auth/register` - Créer un compte
- `POST /auth/verify-email` - Vérifier email avec code
- `POST /auth/login` - Se connecter
- `POST /auth/forgot-password` - Demander reset password
- `POST /auth/reset-password` - Réinitialiser password
- `POST /auth/refresh` - Rafraîchir le token

### Endpoints Protégés

Tous les autres endpoints nécessitent un token JWT. Le token est automatiquement ajouté via :

```
Authorization: Bearer {{accessToken}}
```

### Exemple : Récupérer les Utilisateurs

1. Assurez-vous d'être connecté (voir Workflow d'Authentification)
2. Ouvrez **Users > Get All Users**
3. Regardez l'onglet **Authorization** : `Bearer Token` avec `{{accessToken}}`
4. Modifiez les query parameters si nécessaire :
   - `page`: 1
   - `limit`: 10
   - `search`: (optionnel)
   - `sortBy`: firstName / email / createdAt
   - `sortOrder`: asc / desc
5. Cliquez sur **Send**

### Exemple : Créer un Utilisateur

1. Ouvrez **Users > Create User**
2. Vérifiez le body :
   ```json
   {
     "email": "newuser@example.com",
     "password": "Password123!",
     "firstName": "New",
     "lastName": "User",
     "roles": []
   }
   ```
3. Modifiez les valeurs selon vos besoins
4. Cliquez sur **Send**

---

## 🧪 Tests de Permissions

### Tester avec Différents Comptes

#### Super Admin (Tous les droits)
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```
✅ Peut tout faire : CRUD Users, Roles, Permissions

#### Admin (Droits élevés)
```json
{
  "email": "manager@example.com",
  "password": "Manager123!"
}
```
✅ CRUD Users et Roles
❌ Création/Suppression de Permissions

#### User (Droits limités)
```json
{
  "email": "user@example.com",
  "password": "User123!"
}
```
❌ Aucun accès CRUD
✅ Accès dashboard uniquement

### Test de Permission Refusée

1. Connectez-vous avec `user@example.com`
2. Essayez **Users > Create User**
3. Vous obtiendrez une erreur `403 Forbidden` :
   ```json
   {
     "success": false,
     "message": "Accès refusé : permission insuffisante"
   }
   ```

---

## 📊 Structure de la Collection

```
Users Permissions Management API
│
├── Authentication
│   ├── Register
│   ├── Verify Email
│   ├── Login (sauvegarde auto du token)
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Refresh Token
│   ├── Logout
│   └── Get Current User
│
├── Users
│   ├── Get All Users (pagination, search, sort)
│   ├── Get User by ID
│   ├── Create User
│   ├── Update User
│   ├── Delete User
│   ├── Toggle User Status
│   └── Assign Roles to User
│
├── Roles
│   ├── Get All Roles
│   ├── Get Role by ID
│   ├── Create Role
│   ├── Update Role
│   ├── Delete Role
│   └── Attach Permissions (deprecated)
│
└── Permissions
    ├── Get All Permissions
    ├── Get Permission by ID
    ├── Create Permission
    ├── Update Permission
    └── Delete Permission
```

---

## 🔧 Personnalisation des Requêtes

### Modifier les Query Parameters

Exemple pour **Get All Users** :

```
{{baseUrl}}/users?page=2&limit=20&search=john&sortBy=firstName&sortOrder=asc&isActive=true
```

### Modifier les Variables dans les URLs

Remplacez les valeurs entre `:` :

```
{{baseUrl}}/users/:id
```

Devient :

```
{{baseUrl}}/users/507f1f77bcf86cd799439011
```

Ou utilisez les variables Postman :

1. Créez une variable `userId` dans la collection
2. Utilisez : `{{baseUrl}}/users/{{userId}}`

---

## 🐛 Dépannage

### Erreur 401 Unauthorized

**Problème :** Token expiré ou invalide

**Solution :**
1. Allez dans **Authentication > Login**
2. Reconnectez-vous pour obtenir un nouveau token
3. Ou utilisez **Authentication > Refresh Token**

### Erreur 403 Forbidden

**Problème :** Permission insuffisante

**Solution :**
1. Connectez-vous avec un compte ayant les bonnes permissions
2. Utilisez `admin@example.com` pour tous les droits

### Erreur 429 Too Many Requests

**Problème :** Rate limit dépassé

**Solution :**
1. Attendez 15 minutes
2. Ou redémarrez le serveur backend (en dev)

### Variable {{accessToken}} vide

**Problème :** Le script de sauvegarde automatique n'a pas fonctionné

**Solution :**
1. Allez dans **Authentication > Login**
2. Cliquez sur l'onglet **Tests**
3. Vérifiez que le script est présent :
   ```javascript
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       if (jsonData.data && jsonData.data.accessToken) {
           pm.collectionVariables.set('accessToken', jsonData.data.accessToken);
       }
   }
   ```
4. Re-cliquez sur **Send**
5. Ou copiez manuellement le token de la réponse dans les variables

### Serveur non accessible

**Problème :** `Error: connect ECONNREFUSED 127.0.0.1:5000`

**Solution :**
1. Vérifiez que le serveur backend est démarré :
   ```bash
   cd server
   npm run dev
   ```
2. Vérifiez l'URL dans `baseUrl` : `http://localhost:5000/api`

---

## 📚 Ressources Supplémentaires

- **Documentation API complète :** Voir `API_DOCUMENTATION.md`
- **Configuration environnement :** Voir `CONFIGURATION.md`
- **Code source :** `server/src/routes/`, `server/src/controllers/`

---

## 🎯 Scénarios de Test Recommandés

### Scénario 1 : Inscription et Vérification Email

1. **Register** : Créer un compte
2. Vérifier l'email reçu avec le code à 6 chiffres
3. **Verify Email** : Entrer le code
4. **Login** : Se connecter

### Scénario 2 : Reset Password

1. **Forgot Password** : Demander un code de reset
2. Vérifier l'email avec le code à 6 chiffres
3. **Reset Password** : Entrer le code et nouveau mot de passe
4. **Login** : Se connecter avec le nouveau mot de passe

### Scénario 3 : CRUD Complet Utilisateurs

1. **Login** avec `admin@example.com`
2. **Get All Users** : Voir la liste
3. **Create User** : Créer un utilisateur
4. **Get User by ID** : Récupérer l'utilisateur créé
5. **Update User** : Modifier ses informations
6. **Assign Roles** : Lui donner un rôle
7. **Toggle Status** : Le désactiver/réactiver
8. **Delete User** : Le supprimer

### Scénario 4 : Gestion des Rôles et Permissions

1. **Get All Permissions** : Voir les permissions disponibles
2. **Create Role** : Créer un rôle "Editor"
3. **Update Role** : Lui ajouter des permissions (user.read, user.update)
4. **Get All Roles** : Vérifier la création
5. **Assign Roles to User** : Assigner ce rôle à un utilisateur
6. **Delete Role** : Supprimer le rôle

---

## ✅ Checklist de Validation

Avant de livrer votre délivrable, testez :

- [x] Login avec tous les comptes de test
- [x] Création d'utilisateur avec email
- [x] Vérification email avec code à 6 chiffres
- [x] Reset password avec code à 6 chiffres
- [x] CRUD complet sur Users, Roles, Permissions
- [x] Pagination et recherche
- [x] Tests de permissions (403 avec compte User)
- [x] Refresh token
- [x] Logout

---

**Bon test ! 🚀**
