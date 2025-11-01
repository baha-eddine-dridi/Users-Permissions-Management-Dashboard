import React, { useState } from 'react';
import { authApi } from '../services/authApi';

const LoginTestPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin123!');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🔄 Tentative de connexion...', { email, password });
      const response = await authApi.login({ email, password });
      console.log('✅ Réponse reçue:', response);
      setResult(response);
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.message || err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const testData = {
        email: 'test.user@example.com',
        password: 'TestUser123!',
        firstName: 'Test',
        lastName: 'User'
      };
      console.log('🔄 Tentative d\'inscription...', testData);
      const response = await authApi.register(testData);
      console.log('✅ Réponse reçue:', response);
      setResult(response);
    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.message || err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🧪 Test de l'API d'authentification
        </h1>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? '⏳ Test en cours...' : '🔑 Tester Login'}
          </button>
          <button
            onClick={testRegister}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? '⏳ Test en cours...' : '📝 Tester Register'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>✅ Succès:</strong>
            <pre className="mt-2 text-sm overflow-auto bg-green-50 p-2 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions de test:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Ouvrez la console du navigateur (F12)</li>
            <li>2. Cliquez sur "Tester Login" avec les identifiants Super Admin</li>
            <li>3. Vérifiez les logs dans la console et le résultat affiché</li>
            <li>4. Si ça fonctionne, le problème vient du store d'authentification</li>
            <li>5. Si ça ne fonctionne pas, vérifiez les erreurs CORS/réseau</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🔐 Comptes de test:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li><strong>Super Admin:</strong> admin@example.com / Admin123!</li>
            <li><strong>Admin:</strong> manager@example.com / Manager123!</li>
            <li><strong>User:</strong> user@example.com / User123!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginTestPage;
