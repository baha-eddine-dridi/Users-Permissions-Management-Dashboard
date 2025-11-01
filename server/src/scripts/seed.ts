import dotenv from 'dotenv';
import { Database } from '../config/database';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import { User } from '../models/User';

// Charger les variables d'environnement
dotenv.config();

/**
 * Permissions par défaut du système
 */
const defaultPermissions = [
  // Permissions utilisateur
  { name: 'user.read', resource: 'user', action: 'read', description: 'Lire les informations des utilisateurs' },
  { name: 'user.create', resource: 'user', action: 'create', description: 'Créer de nouveaux utilisateurs' },
  { name: 'user.update', resource: 'user', action: 'update', description: 'Modifier les utilisateurs existants' },
  { name: 'user.delete', resource: 'user', action: 'delete', description: 'Supprimer des utilisateurs' },

  // Permissions rôle
  { name: 'role.read', resource: 'role', action: 'read', description: 'Lire les informations des rôles' },
  { name: 'role.create', resource: 'role', action: 'create', description: 'Créer de nouveaux rôles' },
  { name: 'role.update', resource: 'role', action: 'update', description: 'Modifier les rôles existants' },
  { name: 'role.delete', resource: 'role', action: 'delete', description: 'Supprimer des rôles' },

  // Permissions permission
  { name: 'permission.read', resource: 'permission', action: 'read', description: 'Lire les informations des permissions' },
  { name: 'permission.create', resource: 'permission', action: 'create', description: 'Créer de nouvelles permissions' },
  { name: 'permission.update', resource: 'permission', action: 'update', description: 'Modifier les permissions existantes' },
  { name: 'permission.delete', resource: 'permission', action: 'delete', description: 'Supprimer des permissions' },

  // Permissions système
  { name: 'system.admin', resource: 'system', action: 'admin', description: 'Accès administrateur complet au système' },
  { name: 'dashboard.access', resource: 'dashboard', action: 'access', description: 'Accéder au tableau de bord' },
  { name: 'reports.view', resource: 'reports', action: 'view', description: 'Voir les rapports système' },
  { name: 'audit.view', resource: 'audit', action: 'view', description: 'Voir les logs d\'audit' },
];

/**
 * Rôles par défaut du système avec leurs permissions
 */
const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Accès complet à toutes les fonctionnalités du système',
    permissions: [
      'user.read', 'user.create', 'user.update', 'user.delete',
      'role.read', 'role.create', 'role.update', 'role.delete',
      'permission.read', 'permission.create', 'permission.update', 'permission.delete',
      'system.admin', 'dashboard.access', 'reports.view', 'audit.view'
    ]
  },
  {
    name: 'Admin',
    description: 'Administrateur avec permissions étendues sauf gestion des rôles/permissions',
    permissions: [
      'user.read', 'user.create', 'user.update', 'user.delete',
      'role.read', 'permission.read',
      'dashboard.access', 'reports.view'
    ]
  },
  {
    name: 'Manager',
    description: 'Gestionnaire avec permissions de lecture et modification limitée',
    permissions: [
      'user.read', 'user.update',
      'role.read', 'permission.read',
      'dashboard.access'
    ]
  },
  {
    name: 'User',
    description: 'Utilisateur standard avec permissions de base',
    permissions: [
      'dashboard.access'
    ]
  }
];

/**
 * Utilisateurs par défaut du système
 */
const defaultUsers = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    firstName: 'Super',
    lastName: 'Administrator',
    role: 'Super Admin',
    emailVerified: true
  },
  {
    email: 'manager@example.com',
    password: 'Manager123!',
    firstName: 'John',
    lastName: 'Manager',
    role: 'Admin',
    emailVerified: true
  },
  {
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Jane',
    lastName: 'User',
    role: 'User',
    emailVerified: true
  },
  {
    email: 'alice@example.com',
    password: 'Alice123!',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'Manager',
    emailVerified: true
  },
  {
    email: 'bob@example.com',
    password: 'Bob123!',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'User',
    emailVerified: true
  }
];

/**
 * Créer les permissions par défaut
 */
async function seedPermissions(): Promise<Map<string, string>> {
  console.log('🔑 Création des permissions...');
  
  const permissionMap = new Map<string, string>();

  for (const permData of defaultPermissions) {
    try {
      let permission = await Permission.findOne({ name: permData.name });
      
      if (!permission) {
        permission = new Permission(permData);
        await permission.save();
        console.log(`  ✅ Permission créée: ${permData.name}`);
      } else {
        console.log(`  ⚠️ Permission existante: ${permData.name}`);
      }
      
      permissionMap.set(permData.name, permission.id);
    } catch (error) {
      console.error(`  ❌ Erreur création permission ${permData.name}:`, error);
    }
  }

  return permissionMap;
}

/**
 * Créer les rôles par défaut
 */
async function seedRoles(permissionMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('👥 Création des rôles...');
  
  const roleMap = new Map<string, string>();

  for (const roleData of defaultRoles) {
    try {
      let role = await Role.findOne({ name: roleData.name });
      
      if (!role) {
        // Mapper les noms de permissions vers leurs IDs
        const permissionIds = roleData.permissions
          .map(permName => permissionMap.get(permName))
          .filter(id => id !== undefined) as string[];

        role = new Role({
          name: roleData.name,
          description: roleData.description,
          permissions: permissionIds
        });
        
        await role.save();
        console.log(`  ✅ Rôle créé: ${roleData.name} (${permissionIds.length} permissions)`);
      } else {
        console.log(`  ⚠️ Rôle existant: ${roleData.name}`);
      }
      
      roleMap.set(roleData.name, role.id);
    } catch (error) {
      console.error(`  ❌ Erreur création rôle ${roleData.name}:`, error);
    }
  }

  return roleMap;
}

/**
 * Créer les utilisateurs par défaut
 */
async function seedUsers(roleMap: Map<string, string>): Promise<void> {
  console.log('👤 Création des utilisateurs...');

  for (const userData of defaultUsers) {
    try {
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        const roleId = roleMap.get(userData.role);
        if (!roleId) {
          console.error(`  ❌ Rôle non trouvé: ${userData.role}`);
          continue;
        }

        user = new User({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roles: [roleId],
          emailVerified: userData.emailVerified
        });
        
        await user.save();
        console.log(`  ✅ Utilisateur créé: ${userData.email} (${userData.role})`);
      } else {
        console.log(`  ⚠️ Utilisateur existant: ${userData.email}`);
      }
    } catch (error) {
      console.error(`  ❌ Erreur création utilisateur ${userData.email}:`, error);
    }
  }
}

/**
 * Afficher un résumé des données créées
 */
async function displaySummary(): Promise<void> {
  console.log('\n📊 Résumé des données:');
  
  const permissionCount = await Permission.countDocuments();
  const roleCount = await Role.countDocuments();
  const userCount = await User.countDocuments();
  
  console.log(`  • Permissions: ${permissionCount}`);
  console.log(`  • Rôles: ${roleCount}`);
  console.log(`  • Utilisateurs: ${userCount}`);
  
  console.log('\n🔐 Comptes de test disponibles:');
  console.log('  • Super Admin: admin@example.com / Admin123!');
  console.log('  • Admin: manager@example.com / Manager123!');
  console.log('  • Manager: alice@example.com / Alice123!');
  console.log('  • User: user@example.com / User123!');
  console.log('  • User: bob@example.com / Bob123!');
}

/**
 * Fonction principale de seed
 */
async function seed(): Promise<void> {
  console.log('🌱 Démarrage du seed de la base de données...\n');

  try {
    // Connecter à la base de données
    const db = Database.getInstance();
    await db.connect();

    // Créer les données dans l'ordre
    const permissionMap = await seedPermissions();
    const roleMap = await seedRoles(permissionMap);
    await seedUsers(roleMap);

    // Afficher le résumé
    await displaySummary();

    console.log('\n✅ Seed terminé avec succès!');
  } catch (error) {
    console.error('\n❌ Erreur lors du seed:', error);
    throw error;
  }
}

/**
 * Fonction pour nettoyer la base de données (optionnel)
 */
async function clean(): Promise<void> {
  console.log('🧹 Nettoyage de la base de données...');

  try {
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    
    console.log('✅ Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  clean()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
