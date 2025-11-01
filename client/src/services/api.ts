import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  Role,
  Permission,
  CreateUserForm,
  UpdateUserForm,
  CreateRoleForm,
  UpdateRoleForm,
  CreatePermissionForm,
  UpdatePermissionForm,
  UserFilters,
  RoleFilters,
  PermissionFilters,
  PaginatedResponse,
} from '@/types';

/**
 * Configuration de l'API
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true,
};

/**
 * Service API principal
 */
class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  /**
   * Configuration des intercepteurs
   */
  private setupInterceptors(): void {
    // Intercepteur de réponse pour gérer les erreurs globalement
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Gestion du refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null);
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.handleAuthError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Gestion des autres erreurs
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Traitement de la queue des requêtes en attente
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Gestion des erreurs d'authentification
   */
  private handleAuthError(): void {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
    toast.error('Session expirée. Veuillez vous reconnecter.');
  }

  /**
   * Gestion des erreurs API
   */
  private handleApiError(error: AxiosError): void {
    const response = error.response?.data as ApiResponse;
    const message = response?.message || error.message || 'Une erreur est survenue';

    // Ne pas afficher les erreurs 401 (gérées par l'intercepteur)
    if (error.response?.status !== 401) {
      toast.error(message);
    }
  }

  /**
   * Refresh du token d'accès
   */
  private async refreshToken(): Promise<void> {
    try {
      await this.api.post('/auth/refresh-token');
    } catch (error) {
      throw error;
    }
  }

  // ==================== MÉTHODES D'AUTHENTIFICATION ====================

  /**
   * Connexion utilisateur
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  }

  /**
   * Inscription utilisateur
   */
  async register(data: RegisterData): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data!;
  }

  /**
   * Déconnexion utilisateur
   */
  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  /**
   * Obtenir le profil utilisateur
   */
  async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(email: string): Promise<void> {
    await this.api.post('/auth/forgot-password', { email });
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await this.api.post('/auth/reset-password', { token, password });
  }

  // ==================== MÉTHODES UTILISATEURS ====================

  /**
   * Obtenir la liste des utilisateurs
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: filters,
    });
    return response.data.data!;
  }

  /**
   * Obtenir un utilisateur par ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(data: CreateUserForm): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  }

  /**
   * Mettre à jour un utilisateur
   */
  async updateUser(id: string, data: UpdateUserForm): Promise<User> {
    const response = await this.api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  }

  /**
   * Supprimer un utilisateur
   */
  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  /**
   * Activer/désactiver un utilisateur
   */
  async toggleUserStatus(id: string): Promise<User> {
    const response = await this.api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    return response.data.data!;
  }

  /**
   * Assigner des rôles à un utilisateur
   */
  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>(`/users/${id}/assign-roles`, {
      roleIds,
    });
    return response.data.data!;
  }

  // ==================== MÉTHODES RÔLES ====================

  /**
   * Obtenir la liste des rôles
   */
  async getRoles(filters?: RoleFilters): Promise<PaginatedResponse<Role>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Role>>>('/roles', {
      params: filters,
    });
    return response.data.data!;
  }

  /**
   * Obtenir un rôle par ID
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await this.api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data!;
  }

  /**
   * Créer un nouveau rôle
   */
  async createRole(data: CreateRoleForm): Promise<Role> {
    const response = await this.api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data!;
  }

  /**
   * Mettre à jour un rôle
   */
  async updateRole(id: string, data: UpdateRoleForm): Promise<Role> {
    const response = await this.api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data!;
  }

  /**
   * Supprimer un rôle
   */
  async deleteRole(id: string): Promise<void> {
    await this.api.delete(`/roles/${id}`);
  }

  /**
   * Attacher des permissions à un rôle
   */
  async attachPermissions(id: string, permissionIds: string[]): Promise<Role> {
    const response = await this.api.post<ApiResponse<Role>>(`/roles/${id}/attach-permissions`, {
      permissionIds,
    });
    return response.data.data!;
  }

  // ==================== MÉTHODES PERMISSIONS ====================

  /**
   * Obtenir la liste des permissions
   */
  async getPermissions(filters?: PermissionFilters): Promise<PaginatedResponse<Permission>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Permission>>>('/roles/permissions', {
      params: filters,
    });
    return response.data.data!;
  }

  /**
   * Obtenir une permission par ID
   */
  async getPermissionById(id: string): Promise<Permission> {
    const response = await this.api.get<ApiResponse<Permission>>(`/roles/permissions/${id}`);
    return response.data.data!;
  }

  /**
   * Créer une nouvelle permission
   */
  async createPermission(data: CreatePermissionForm): Promise<Permission> {
    const response = await this.api.post<ApiResponse<Permission>>('/roles/permissions', data);
    return response.data.data!;
  }

  /**
   * Mettre à jour une permission
   */
  async updatePermission(id: string, data: UpdatePermissionForm): Promise<Permission> {
    const response = await this.api.put<ApiResponse<Permission>>(`/roles/permissions/${id}`, data);
    return response.data.data!;
  }

  /**
   * Supprimer une permission
   */
  async deletePermission(id: string): Promise<void> {
    await this.api.delete(`/roles/permissions/${id}`);
  }
}

// Instance singleton du service API
export const apiService = new ApiService();
export default apiService;
