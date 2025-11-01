import React, { useState } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: Date;
}

const PermissionsPage: React.FC = () => {
  const [permissions] = useState<Permission[]>([
    {
      id: '1',
      name: 'user.read',
      description: 'Lire les informations des utilisateurs',
      resource: 'user',
      action: 'read',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'user.create',
      description: 'Créer de nouveaux utilisateurs',
      resource: 'user',
      action: 'create',
      createdAt: new Date(),
    },
    {
      id: '3',
      name: 'user.update',
      description: 'Modifier les informations des utilisateurs',
      resource: 'user',
      action: 'update',
      createdAt: new Date(),
    },
    {
      id: '4',
      name: 'user.delete',
      description: 'Supprimer des utilisateurs',
      resource: 'user',
      action: 'delete',
      createdAt: new Date(),
    },
    {
      id: '5',
      name: 'role.read',
      description: 'Lire les informations des rôles',
      resource: 'role',
      action: 'read',
      createdAt: new Date(),
    },
    {
      id: '6',
      name: 'role.create',
      description: 'Créer de nouveaux rôles',
      resource: 'role',
      action: 'create',
      createdAt: new Date(),
    },
    {
      id: '7',
      name: 'role.update',
      description: 'Modifier les rôles existants',
      resource: 'role',
      action: 'update',
      createdAt: new Date(),
    },
    {
      id: '8',
      name: 'role.delete',
      description: 'Supprimer des rôles',
      resource: 'role',
      action: 'delete',
      createdAt: new Date(),
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('all');

  const filteredPermissions = selectedResource === 'all' 
    ? permissions 
    : permissions.filter(p => p.resource === selectedResource);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestion des permissions
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nouvelle permission
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Toutes les ressources</option>
            <option value="user">Utilisateurs</option>
            <option value="role">Rôles</option>
          </select>
        </div>
      </div>

      {/* Liste des permissions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPermissions.map((permission) => (
            <li key={permission.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {permission.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {permission.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {permission.resource}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(permission.action)}`}>
                    {permission.action}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Modifier
                  </button>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Créer une nouvelle permission
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nom de la permission
                  </label>
                  <input
                    type="text"
                    placeholder="ex: user.read"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Description de la permission..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ressource
                  </label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="user">Utilisateur</option>
                    <option value="role">Rôle</option>
                    <option value="permission">Permission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action
                  </label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="read">Lecture</option>
                    <option value="create">Création</option>
                    <option value="update">Modification</option>
                    <option value="delete">Suppression</option>
                  </select>
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

export default PermissionsPage;
