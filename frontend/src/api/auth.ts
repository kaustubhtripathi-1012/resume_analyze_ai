import apiClient from './axios';
import { User } from '../store/authStore';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'candidate' | 'recruiter';
  visibleToRecruiters?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async me(): Promise<{ user: User }> {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
};

