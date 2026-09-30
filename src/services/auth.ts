import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

/* =========================
   Types
========================= */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  cnic?: string;
  role?: 'citizen' | 'ngo' | 'official';
  organization_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    role: 'citizen' | 'ngo' | 'official';
    [key: string]: any;
  };
}

/* =========================
   Storage Keys (centralized)
========================= */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'sudhaar_user';
const ROLE_KEY = 'sudhaar_role';

/* =========================
   Helpers
========================= */

const persistAuth = (data: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(
    ROLE_KEY,
    data.user.role?.toLowerCase().trim()
  );
};

const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
};

/* =========================
   Auth Service
========================= */

export const authService = {
  /* ---------- LOGIN ---------- */
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials,
      false
    );

    if (response.data) {
      persistAuth(response.data);
    }

    return response;
  },

  /* ---------- REGISTER ---------- */
  async register(data: RegisterData) {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.REGISTER,
      data,
      false
    );

    if (response.data) {
      persistAuth(response.data);
    }

    return response;
  },

  /* ---------- TOKEN REFRESH ---------- */
  async refreshToken() {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) {
      clearAuth();
      return { error: 'No refresh token available' };
    }

    const response = await apiService.post<{ access: string }>(
      API_ENDPOINTS.REFRESH,
      { refresh },
      false
    );

    if (response.data?.access) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);
    }

    return response;
  },

  /* ---------- USER ---------- */
  async getCurrentUser() {
    return apiService.get(API_ENDPOINTS.USER_ME);
  },

  /* ---------- LOGOUT ---------- */
  logout() {
    clearAuth();
  },

  /* ---------- HELPERS ---------- */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  },

  getUser(): any | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
};
