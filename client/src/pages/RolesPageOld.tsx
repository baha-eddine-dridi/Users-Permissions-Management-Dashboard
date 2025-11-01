import React, { useState } from 'react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
}

const RolesPage: React.FC = () => {
  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'Accès complet à toutes les fonctionnalités',
      permissions: ['user.read', 'user.create', 'user.update', 'user.delete', 'role.read', 'role.create', 'role.update', 'role.delete'],
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Administration des utilisateurs et rôles',
      permissions: ['user.read', 'user.create', 'user.update', 'role.read'],
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'Manager',
      description: 'Gestion des utilisateurs de son équipe',
      permissions: ['user.read', 'user.update'],
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'User',
      description: 'Utilisateur standard avec accès limité',
      permissions: ['user.read'],
      createdAt: new Date(),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des rôles
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nouveau rôle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {role.name}
                </h3>
                <div className="flex space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                    Modifier
                  </button>
                  {role.name !== 'Super Admin' && (
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {role.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Permissions ({role.permissions.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {permission}
                    </span>
                  ))}
                  {role.permissions.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{role.permissions.length - 3} autres
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Créé le {role.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Créer un nouveau rôle
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom du rôle
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['user.read', 'user.create', 'user.update', 'user.delete', 'role.read', 'role.create', 'role.update', 'role.delete'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
