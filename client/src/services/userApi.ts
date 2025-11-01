import axios from 'axios';
import { User } from '../types';

const API_URL = 'http://localhost:5000/api';

// Configuration d'axios avec les cookies
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les cookies de refresh
});

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export const userApi = {
  // Récupérer tous les utilisateurs avec pagination
  getUsers: async (page = 1, limit = 10, search = ''): Promise<UsersResponse> => {
    console.log('🔄 API: Récupération des utilisateurs...', { page, limit, search });
    const response = await api.get('/users', {
      params: { page, limit, search }
    });
    console.log('✅ API: Utilisateurs récupérés', response.data);
    return response.data;
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (id: string): Promise<UserResponse> => {
    console.log('🔄 API: Récupération utilisateur par ID...', { id });
    const response = await api.get(`/users/${id}`);
    console.log('✅ API: Utilisateur récupéré', response.data);
    return response.data;
  },

  // Créer un nouvel utilisateur
  createUser: async (userData: CreateUserData): Promise<UserResponse> => {
    console.log('🔄 API: Création d\'un utilisateur...', userData);
    const response = await api.post('/users', userData);
    console.log('✅ API: Utilisateur créé', response.data);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (id: string, userData: UpdateUserData): Promise<UserResponse> => {
    console.log('🔄 API: Mise à jour utilisateur...', { id, userData });
    const response = await api.put(`/users/${id}`, userData);
    console.log('✅ API: Utilisateur mis à jour', response.data);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    console.log('🔄 API: Suppression utilisateur...', { id });
    const response = await api.delete(`/users/${id}`);
    console.log('✅ API: Utilisateur supprimé', response.data);
    return response.data;
  },

  // Assigner des rôles à un utilisateur
  assignRoles: async (userId: string, roleIds: string[]): Promise<UserResponse> => {
    console.log('🔄 API: Attribution de rôles...', { userId, roleIds });
    const response = await api.post(`/users/${userId}/roles`, { roleIds });
    console.log('✅ API: Rôles attribués', response.data);
    return response.data;
  },

  // Retirer des rôles d'un utilisateur
  removeRoles: async (userId: string, roleIds: string[]): Promise<UserResponse> => {
    console.log('🔄 API: Retrait de rôles...', { userId, roleIds });
    const response = await api.delete(`/users/${userId}/roles`, { data: { roleIds } });
    console.log('✅ API: Rôles retirés', response.data);
    return response.data;
  }
};
