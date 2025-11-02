import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuration de l'instance axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interface pour les permissions
interface Permission {
  _id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreatePermissionData {
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface UpdatePermissionData {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
  isActive?: boolean;
}

// Service pour la gestion des permissions
export const permissionsApi = {
  // Récupérer toutes les permissions
  getPermissions: async () => {
    const response = await apiClient.get('/roles/permissions');
    return response.data;
  },

  // Récupérer une permission par ID
  getPermission: async (id: string) => {
    const response = await apiClient.get(`/roles/permissions/${id}`);
    return response.data;
  },

  // Créer une nouvelle permission
  createPermission: async (permissionData: CreatePermissionData) => {
    const response = await apiClient.post('/roles/permissions', permissionData);
    return response.data;
  },

  // Mettre à jour une permission
  updatePermission: async (id: string, permissionData: UpdatePermissionData) => {
    const response = await apiClient.put(`/roles/permissions/${id}`, permissionData);
    return response.data;
  },

  // Supprimer une permission
  deletePermission: async (id: string) => {
    const response = await apiClient.delete(`/roles/permissions/${id}`);
    return response.data;
  },

  // Activer/désactiver une permission
  togglePermissionStatus: async (id: string) => {
    const response = await apiClient.patch(`/roles/permissions/${id}/toggle-status`);
    return response.data;
  },
};
