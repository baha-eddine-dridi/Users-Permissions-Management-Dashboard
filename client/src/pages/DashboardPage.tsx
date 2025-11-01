import React from 'react';
import { useAuthStore } from '../stores/authStore';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue, {user?.firstName} {user?.lastName} !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Statistiques utilisateurs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rôles */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Rôles
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques permissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2M7 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0V9a2 2 0 012-2m0 0V7a2 2 0 012-2m-2 2H9m10 0v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2h10z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Permissions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-left">
            <div className="text-sm font-medium text-gray-900">Nouvel utilisateur</div>
            <div className="text-sm text-gray-500">Créer un nouveau compte utilisateur</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-left">
            <div className="text-sm font-medium text-gray-900">Nouveau rôle</div>
            <div className="text-sm text-gray-500">Définir un nouveau rôle</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-left">
            <div className="text-sm font-medium text-gray-900">Voir les logs</div>
            <div className="text-sm text-gray-500">Consulter l'activité système</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 hover:bg-gray-50 text-left">
            <div className="text-sm font-medium text-gray-900">Paramètres</div>
            <div className="text-sm text-gray-500">Configurer l'application</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
