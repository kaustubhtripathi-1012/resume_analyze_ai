import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  visibleToRecruiters?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: !!accessToken }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false })
}));

