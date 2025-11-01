import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configuration de l'instance axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour les cookies
});

// Interface pour les utilisateurs
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

// Service pour la gestion des utilisateurs
export const usersApi = {
  // Récupérer tous les utilisateurs
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUser: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Créer un nouvel utilisateur
  createUser: async (userData: CreateUserData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (id: string, userData: UpdateUserData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Activer/désactiver un utilisateur
  toggleUserStatus: async (id: string) => {
    const response = await apiClient.patch(`/users/${id}/toggle-status`);
    return response.data;
  },
};
