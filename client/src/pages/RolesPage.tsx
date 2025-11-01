import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { rolesApi, CreateRoleData, UpdateRoleData, Role } from '../services/rolesApi';

const RolesPage: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);

  // Fonction utilitaire pour obtenir l'ID d'un rôle
  const getRoleId = (role: Role): string => {
    return role.id || role._id || '';
  };

  // Charger les rôles
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des rôles...');
      const response = await rolesApi.getRoles();
      setRoles(response.data.roles || response.data);
      console.log('✅ Rôles chargés:', (response.data.roles || response.data).length);
      console.log('🔍 Exemple de structure de rôle:', (response.data.roles || response.data)[0]);
      console.log('🔍 Permissions du premier rôle:', (response.data.roles || response.data)[0]?.permissions);
      console.log('🔍 ID du premier rôle (_id):', (response.data.roles || response.data)[0]?._id);
      console.log('🔍 ID du premier rôle (id):', (response.data.roles || response.data)[0]?.id);
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des rôles:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadRoles();
      await loadPermissions();
    };
    init();
  }, []);

  // Charger les permissions disponibles
  const loadPermissions = async () => {
    try {
      console.log('🔄 Chargement des permissions disponibles...');
      const response = await rolesApi.getPermissions();
      console.log('📋 Réponse brute des permissions:', response);
      console.log('📋 response.data:', response.data);
      console.log('📋 response.data.permissions:', response.data.permissions);
      
      const permissions = response.data.permissions || response.data;
      setAvailablePermissions(permissions);
      console.log('✅ Permissions chargées:', permissions.length, 'permissions');
      console.log('📋 Première permission exemple:', permissions[0]);
      console.log('📋 Structure des permissions:', permissions.map((p: any) => ({ name: p.name, _id: p._id, id: p.id })));
    } catch (err) {
      console.error('❌ Erreur lors du chargement des permissions:', err);
    }
  };

  // Supprimer un rôle
  const handleDeleteRole = async (roleId: string) => {
    if (!hasPermission('role.delete')) {
      setError('Vous n\'avez pas la permission de supprimer des rôles');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        setActionLoading(true);
        await rolesApi.deleteRole(roleId);
        await loadRoles(); // Recharger la liste
        console.log('✅ Rôle supprimé avec succès');
      } catch (err: any) {
        console.error('❌ Erreur lors de la suppression:', err);
        setError(err.response?.data?.message || 'Erreur lors de la suppression');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Créer un rôle
  const handleCreateRole = async (roleData: CreateRoleData) => {
    try {
      setActionLoading(true);
      
      // Convertir les noms de permissions en IDs
      let permissionIds: string[] = [];
      if (roleData.permissions && roleData.permissions.length > 0) {
        permissionIds = roleData.permissions.map(permName => {
          const permission = availablePermissions.find(p => p.name === permName);
          return permission ? permission._id : null;
        }).filter(Boolean);
      }

      // Préparer les données avec les IDs de permissions
      const createData = {
        ...roleData,
        permissions: permissionIds
      };

      await rolesApi.createRole(createData);
      await loadRoles(); // Recharger la liste
      setShowCreateModal(false);
      console.log('✅ Rôle créé avec succès');
    } catch (err: any) {
      console.error('❌ Erreur lors de la création:', err);
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setActionLoading(false);
    }
  };

  // Modifier un rôle
  const handleUpdateRole = async (roleId: string, roleData: UpdateRoleData) => {
    try {
      setActionLoading(true);
      
      console.log('🔄 Début de la modification du rôle:', { roleId, roleData });
      console.log('🔍 Permissions disponibles:', availablePermissions);
      
      // Vérifier que l'ID est valide (24 caractères hexadécimaux)
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(roleId)) {
        console.error('❌ ID de rôle invalide:', roleId);
        setError('ID de rôle invalide');
        return;
      }
      
      console.log('� Permissions à envoyer:', roleData.permissions);

      // Envoyer les données directement au serveur
      // Le backend gérera la conversion des noms en IDs
      const updateData = roleData;

      console.log('📤 Données envoyées au serveur:', updateData);

      await rolesApi.updateRole(roleId, updateData);
      console.log('✅ Modification terminée côté serveur');
      
      // Attendre un peu pour que la base de données soit mise à jour
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Rechargement des rôles après modification...');
      await loadRoles(); // Recharger la liste
      setShowEditModal(false);
      setSelectedRole(null);
      console.log('✅ Rôle modifié avec succès et interface mise à jour');
    } catch (err: any) {
      console.error('❌ Erreur lors de la modification:', err);
      console.error('📋 Détails de l\'erreur:', err.response?.data);
      console.error('📋 Erreurs de validation:', err.response?.data?.errors);
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des rôles
        </h1>
        {hasPermission('role.create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            + Nouveau rôle
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div key={getRoleId(role)} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex space-x-2">
                {hasPermission('role.update') && (
                  <button
                    onClick={() => {
                      console.log('🔍 Rôle sélectionné pour modification:', role);
                      console.log('🔍 ID du rôle:', getRoleId(role));
                      setSelectedRole(role);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Modifier
                  </button>
                )}
                {hasPermission('role.delete') && (
                  <button
                    onClick={() => handleDeleteRole(getRoleId(role))}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Suppression...' : 'Supprimer'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Permissions ({role.permissions?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.slice(0, 6).map((permission: any, index: number) => {
                    // Gérer les permissions en tant qu'objets ou chaînes
                    const permissionName = typeof permission === 'object' ? permission.name : permission;
                    const permissionKey = typeof permission === 'object' ? permission._id || permission.id || `${permission.name}-${index}` : `${permission}-${index}`;
                    
                    return (
                      <span
                        key={permissionKey}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                      >
                        {permissionName}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-400 text-sm">Aucune permission</span>
                )}
                {role.permissions && role.permissions.length > 6 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                    +{role.permissions.length - 6} autres
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Créé le {new Date(role.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun rôle trouvé</p>
        </div>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
          loading={actionLoading}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedRole && (
        <EditRoleModal
          role={selectedRole}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRole(null);
          }}
          onUpdate={handleUpdateRole}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// Modal de création de rôle
interface CreateRoleModalProps {
  onClose: () => void;
  onCreate: (roleData: CreateRoleData) => void;
  loading: boolean;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  onClose,
  onCreate,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Permissions disponibles
  const availablePermissions = [
    'user.read', 'user.create', 'user.update', 'user.delete',
    'role.read', 'role.create', 'role.update', 'role.delete',
    'permission.read', 'permission.create', 'permission.update', 'permission.delete'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Créer un rôle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du rôle
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Gestionnaire"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du rôle..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions ({formData.permissions.length} sélectionnées)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal d'édition de rôle
interface EditRoleModalProps {
  role: Role;
  onClose: () => void;
  onUpdate: (roleId: string, roleData: UpdateRoleData) => void;
  loading: boolean;
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  role,
  onClose,
  onUpdate,
  loading
}) => {
  // Convertir les permissions en chaînes pour le formulaire
  const getPermissionNames = (permissions: any[]): string[] => {
    return permissions.map(p => typeof p === 'object' ? p.name : p);
  };

  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description,
    permissions: getPermissionNames(role.permissions || [])
  });

  // Permissions disponibles
  const availablePermissions = [
    'user.read', 'user.create', 'user.update', 'user.delete',
    'role.read', 'role.create', 'role.update', 'role.delete',
    'permission.read', 'permission.create', 'permission.update', 'permission.delete'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Soumission du formulaire d\'édition');
    console.log('🔍 Objet rôle complet:', role);
    console.log('🔍 role.id:', role.id);
    console.log('🔍 role._id:', role._id);
    
    // Essayer id d'abord, puis _id
    const roleId = role.id || role._id;
    console.log('🔍 ID final utilisé:', roleId);
    
    if (!roleId) {
      console.error('❌ Aucun ID trouvé pour le rôle');
      return;
    }
    
    console.log('🔍 Données du formulaire:', formData);
    onUpdate(roleId, formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Modifier le rôle</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du rôle
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Gestionnaire"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description du rôle..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions ({formData.permissions.length} sélectionnées)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {availablePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolesPage;
