import { create } from 'zustand';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'User' | 'Owner' | 'Admin';
  isApproved: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isOwner: () => boolean;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'Admin',
  isOwner: () => get().user?.role === 'Owner' || get().user?.role === 'Admin',
}));
