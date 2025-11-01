// Types de base
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Types d'authentification
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface Permission extends BaseEntity {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

// Types d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  lastLogin?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

// Types de formulaires
export interface CreateUserForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export interface UpdateUserForm {
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface CreateRoleForm {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleForm {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface CreatePermissionForm {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionForm {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
  isActive?: boolean;
}

// Types de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Types de filtres
export interface UserFilters extends PaginationParams {
  role?: string;
  isActive?: boolean;
}

export interface RoleFilters extends PaginationParams {
  isActive?: boolean;
}

export interface PermissionFilters extends PaginationParams {
  resource?: string;
  action?: string;
  isActive?: boolean;
}

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Types d'état de l'application
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Types d'actions modales
export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'view' | null;
  data?: any;
}

// Types de navigation
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  permission?: string;
  children?: NavigationItem[];
}

// Types de statistiques (pour le dashboard)
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentLogins: number;
}

// Types de configuration
export interface AppConfig {
  apiUrl: string;
  tokenRefreshInterval: number;
  cookieDomain: string;
}
