import { Database } from '../config/database';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import bcrypt from 'bcryptjs';

/**
 * Script pour peupler la base de données avec des données de test
 */
async function seedDatabase() {
  try {
    console.log('🌱 Démarrage du seed de la base de données...');
    
    // Connexion à la base de données
    const db = Database.getInstance();
    await db.connect();

    // Nettoyer les collections existantes
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});
    console.log('🧹 Collections nettoyées');

    // Créer les permissions
    const permissions = await Permission.insertMany([
      { name: 'user.read', description: 'Lire les utilisateurs' },
      { name: 'user.create', description: 'Créer des utilisateurs' },
      { name: 'user.update', description: 'Modifier des utilisateurs' },
      { name: 'user.delete', description: 'Supprimer des utilisateurs' },
      { name: 'role.read', description: 'Lire les rôles' },
      { name: 'role.create', description: 'Créer des rôles' },
      { name: 'role.update', description: 'Modifier des rôles' },
      { name: 'role.delete', description: 'Supprimer des rôles' },
      { name: 'permission.read', description: 'Lire les permissions' },
      { name: 'permission.create', description: 'Créer des permissions' },
      { name: 'permission.update', description: 'Modifier des permissions' },
      { name: 'permission.delete', description: 'Supprimer des permissions' },
      { name: 'admin.access', description: 'Accès administrateur' },
    ]);
    console.log(`✅ ${permissions.length} permissions créées`);

    // Créer les rôles
    const superAdminRole = await Role.create({
      name: 'Super Admin',
      description: 'Administrateur système avec tous les droits',
      permissions: permissions.map(p => p._id),
    });

    const adminRole = await Role.create({
      name: 'Admin',
      description: 'Administrateur avec la plupart des droits',
      permissions: permissions.filter(p => !p.name.includes('permission')).map(p => p._id),
    });

    const managerRole = await Role.create({
      name: 'Manager',
      description: 'Gestionnaire avec droits limités',
      permissions: permissions.filter(p => p.name.includes('user.read') || p.name.includes('role.read')).map(p => p._id),
    });

    const userRole = await Role.create({
      name: 'User',
      description: 'Utilisateur standard',
      permissions: permissions.filter(p => p.name === 'user.read').map(p => p._id),
    });

    console.log('✅ 4 rôles créés');

    // Créer des utilisateurs de test
    const users = [
      {
        email: 'superadmin@test.com',
        password: await bcrypt.hash('SuperAdmin123!', 12),
        firstName: 'Super',
        lastName: 'Admin',
        roles: [superAdminRole._id],
        isActive: true,
        emailVerified: true,
      },
      {
        email: 'admin@test.com',
        password: await bcrypt.hash('Admin123!', 12),
        firstName: 'Admin',
        lastName: 'User',
        roles: [adminRole._id],
        isActive: true,
        emailVerified: true,
      },
      {
        email: 'manager@test.com',
        password: await bcrypt.hash('Manager123!', 12),
        firstName: 'Manager',
        lastName: 'User',
        roles: [managerRole._id],
        isActive: true,
        emailVerified: true,
      },
      {
        email: 'user@test.com',
        password: await bcrypt.hash('User123!', 12),
        firstName: 'Regular',
        lastName: 'User',
        roles: [userRole._id],
        isActive: true,
        emailVerified: true,
      },
      {
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 12),
        firstName: 'Test',
        lastName: 'Example',
        roles: [userRole._id],
        isActive: true,
        emailVerified: false, // Non vérifié pour tester la vérification d'email
      },
    ];

    await User.insertMany(users);
    console.log(`✅ ${users.length} utilisateurs créés`);

    console.log('🎉 Seed terminé avec succès !');
    console.log('\n📋 Comptes de test créés :');
    console.log('┌─────────────────────┬─────────────────┬────────────────┐');
    console.log('│ Email               │ Mot de passe    │ Rôle           │');
    console.log('├─────────────────────┼─────────────────┼────────────────┤');
    console.log('│ superadmin@test.com │ SuperAdmin123!  │ Super Admin    │');
    console.log('│ admin@test.com      │ Admin123!       │ Admin          │');
    console.log('│ manager@test.com    │ Manager123!     │ Manager        │');
    console.log('│ user@test.com       │ User123!        │ User           │');
    console.log('│ test@example.com    │ Password123!    │ User           │');
    console.log('└─────────────────────┴─────────────────┴────────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

// Exécuter le seed si appelé directement
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
