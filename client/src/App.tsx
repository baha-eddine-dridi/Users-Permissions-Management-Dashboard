import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import RolesPage from '@/pages/RolesPage';
import PermissionsPage from '@/pages/PermissionsPage';
import TestPage from '@/pages/TestPage';
import LoginTestPage from '@/pages/LoginTestPage';

// Composants
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Afficher un spinner pendant le chargement initial
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Route de test CSS */}
      <Route path="/test" element={<TestPage />} />
      <Route path="/test-login" element={<LoginTestPage />} />
      
      {/* Routes publiques */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />

      {/* Routes protégées */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="user.read">
            <Layout>
              <UsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute requiredPermission="role.read">
            <Layout>
              <RolesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissions"
        element={
          <ProtectedRoute requiredPermission="permission.read">
            <Layout>
              <PermissionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Redirections */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
