import axios from 'axios';
import { Role } from '../types';

const API_URL = 'http://localhost:5000/api';

// Configuration d'axios avec les cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface RolesResponse {
  success: boolean;
  data: {
    roles: Role[];
    pagination: {
      page: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

export const roleApi = {
  // Récupérer tous les rôles avec pagination
  getRoles: async (page = 1, limit = 20, search = ''): Promise<RolesResponse> => {
    console.log('🔄 API: Récupération des rôles...', { page, limit, search });
    const response = await api.get('/roles', {
      params: { page, limit, search }
    });
    console.log('✅ API: Rôles récupérés', response.data);
    return response.data;
  },

  // Récupérer un rôle par son ID
  getRoleById: async (id: string): Promise<RoleResponse> => {
    console.log('🔄 API: Récupération rôle par ID...', { id });
    const response = await api.get(`/roles/${id}`);
    console.log('✅ API: Rôle récupéré', response.data);
    return response.data;
  },

  // Créer un nouveau rôle
  createRole: async (roleData: CreateRoleData): Promise<RoleResponse> => {
    console.log('🔄 API: Création d\'un rôle...', roleData);
    const response = await api.post('/roles', roleData);
    console.log('✅ API: Rôle créé', response.data);
    return response.data;
  },

  // Mettre à jour un rôle
  updateRole: async (id: string, roleData: UpdateRoleData): Promise<RoleResponse> => {
    console.log('🔄 API: Mise à jour rôle...', { id, roleData });
    const response = await api.put(`/roles/${id}`, roleData);
    console.log('✅ API: Rôle mis à jour', response.data);
    return response.data;
  },

  // Supprimer un rôle
  deleteRole: async (id: string): Promise<{ success: boolean; message: string }> => {
    console.log('🔄 API: Suppression rôle...', { id });
    const response = await api.delete(`/roles/${id}`);
    console.log('✅ API: Rôle supprimé', response.data);
    return response.data;
  }
};
