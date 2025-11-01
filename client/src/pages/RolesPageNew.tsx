import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';
import { roleApi, CreateRoleData } from '../services/roleApi';

const RolesPage: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger les rôles
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des rôles...');
      const response = await roleApi.getRoles(1, 50);
      setRoles(response.data.roles);
      console.log('✅ Rôles chargés:', response.data.roles.length);
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement des rôles:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des rôles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Supprimer un rôle
  const handleDeleteRole = async (roleId: string) => {
    if (!hasPermission('role.delete')) {
      setError('Vous n\'avez pas la permission de supprimer des rôles');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        setActionLoading(true);
        await roleApi.deleteRole(roleId);
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
      await roleApi.createRole(roleData);
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
          <div key={role._id || role.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex space-x-2">
                {hasPermission('role.update') && (
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    Modifier
                  </button>
                )}
                {hasPermission('role.delete') && (
                  <button
                    onClick={() => handleDeleteRole(role._id || role.id)}
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
                  role.permissions.slice(0, 6).map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                    >
                      {permission}
                    </span>
                  ))
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

export default RolesPage;
