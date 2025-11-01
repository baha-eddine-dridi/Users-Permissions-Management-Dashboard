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
export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

// Interface pour les rôles
export interface Role {
  id: string;
  _id?: string;
  name: string;
  description: string;
  permissions: Permission[] | string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

// Service pour la gestion des rôles
export const rolesApi = {
  // Récupérer tous les rôles
  getRoles: async () => {
    const response = await apiClient.get('/roles');
    return response.data;
  },

  // Récupérer toutes les permissions
  getPermissions: async () => {
    console.log('📡 Appel API vers /roles/permissions');
    const response = await apiClient.get('/roles/permissions');
    console.log('📡 Réponse reçue:', response.data);
    return response.data;
  },

  // Récupérer un rôle par ID
  getRole: async (id: string) => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Créer un nouveau rôle
  createRole: async (roleData: CreateRoleData) => {
    const response = await apiClient.post('/roles', roleData);
    return response.data;
  },

  // Mettre à jour un rôle
  updateRole: async (id: string, roleData: UpdateRoleData) => {
    console.log('🔄 API: Mise à jour du rôle...', { id, roleData });
    const response = await apiClient.put(`/roles/${id}`, roleData);
    console.log('✅ API: Rôle mis à jour', response.data);
    return response.data;
  },

  // Supprimer un rôle
  deleteRole: async (id: string) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  // Activer/désactiver un rôle
  toggleRoleStatus: async (id: string) => {
    const response = await apiClient.patch(`/roles/${id}/toggle-status`);
    return response.data;
  },
};
