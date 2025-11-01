<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instructions personnalisées pour GitHub Copilot

## Contexte du projet
Ce projet est une application Full-Stack TypeScript pour la gestion des utilisateurs, rôles et permissions avec un système RBAC (Role-Based Access Control) complet.

### Stack technique
- **Backend**: Express.js + TypeScript + MongoDB + Mongoose
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Authentification**: JWT + Refresh Tokens + bcrypt
- **Validation**: Zod (backend) + React Hook Form (frontend)
- **State Management**: Zustand
- **API Communication**: Axios + React Query
- **Containerisation**: Docker + docker-compose

## Directives de codage

### Général
- Utiliser TypeScript strict partout
- Privilégier la composition over inheritance
- Implémenter une gestion d'erreur robuste
- Ajouter des commentaires explicatifs pour la logique complexe
- Respecter les principes SOLID
- Utiliser des noms de variables/fonctions explicites en français

### Backend (Express.js + MongoDB)
- Utiliser les middlewares pour l'authentification et l'autorisation
- Implémenter la validation avec Zod sur toutes les routes
- Structurer les contrôleurs avec try/catch et gestion d'erreur uniforme
- Utiliser Mongoose avec des schémas typés
- Implémenter le rate limiting sur les routes sensibles
- Sécuriser les cookies et headers
- Suivre le pattern Repository pour les accès base de données

### Frontend (React + TypeScript)
- Utiliser des composants fonctionnels avec hooks
- Implémenter la gestion d'état avec Zustand
- Utiliser React Hook Form pour les formulaires
- Implémenter React Query pour la gestion des données API
- Utiliser TailwindCSS pour le styling avec des composants réutilisables
- Créer des composants UI modulaires et accessibles
- Implémenter des guards de route basés sur les permissions

### Sécurité
- Valider toutes les entrées utilisateur
- Implémenter CORS correctement
- Utiliser helmet pour les headers de sécurité
- Hasher les mots de passe avec bcrypt
- Implémenter des tokens JWT sécurisés
- Gérer les erreurs sans révéler d'informations sensibles

### Base de données
- Utiliser des indexes appropriés pour les performances
- Implémenter des relations cohérentes entre User/Role/Permission
- Utiliser des validations au niveau schéma
- Implémenter la pagination sur toutes les listes

### Permissions et RBAC
- Système granulaire avec permissions nommées (ex: user.read, role.create)
- Hiérarchie de rôles: Super Admin > Admin > Manager > User
- Guards frontend et middleware backend basés sur les permissions
- Pas de hard-coding des permissions, tout doit être configurable

## Conventions de nommage

### Fichiers et dossiers
- camelCase pour les fichiers TypeScript
- PascalCase pour les composants React
- kebab-case pour les fichiers de configuration
- snake_case pour les variables d'environnement

### Code
- Fonctions: camelCase avec verbes d'action (ex: getUserById, createUser)
- Constantes: UPPER_CASE
- Types/Interfaces: PascalCase avec préfixe I pour interfaces (ex: IUser)
- Composants React: PascalCase
- Hooks personnalisés: préfixe "use" (ex: useAuth, usePermissions)

## Patterns recommandés

### Gestion d'erreur
```typescript
// Backend - Contrôleur
try {
  // logique métier
  res.status(200).json({ success: true, data: result });
} catch (error) {
  console.error('Erreur contexte:', error);
  res.status(500).json({ success: false, message: 'Message utilisateur' });
}

// Frontend - Hook
const { data, error, isLoading } = useQuery(['key'], fetchFn, {
  onError: (error) => toast.error(error.message)
});
```

### Validation
```typescript
// Backend - Route avec validation Zod
router.post('/', validate(createUserSchema), createUser);

// Frontend - Formulaire avec React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
```

### Permissions
```typescript
// Check de permission
if (!hasPermission('user.create')) {
  return <UnauthorizedComponent />;
}
```

## Structure recommandée

### Backend
```
src/
├── controllers/     # Logique métier des routes
├── middleware/      # Auth, validation, rate limiting
├── models/         # Schémas Mongoose
├── routes/         # Définition des routes Express
├── schemas/        # Validation Zod
├── services/       # Services métier (email, etc.)
├── utils/          # Utilitaires (JWT, crypto, etc.)
├── config/         # Configuration (DB, etc.)
└── scripts/        # Scripts de seed/migration
```

### Frontend
```
src/
├── components/     # Composants réutilisables
├── pages/          # Pages de l'application
├── hooks/          # Hooks personnalisés
├── services/       # API calls
├── stores/         # État global (Zustand)
├── types/          # Types TypeScript
├── lib/            # Utilitaires
└── styles/         # Styles globaux
```

## Priorités de développement
1. Sécurité et authentification robuste
2. Système RBAC fonctionnel et flexible
3. Interface utilisateur intuitive et accessible
4. Performance et optimisation
5. Tests et documentation
6. Monitoring et logs

Toujours privilégier la sécurité et la robustesse over la rapidité de développement.
