import { create } from 'zustand';
import { authService } from '../services/auth';

interface User {
  username: string;
  email?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const data = await authService.login(username, password);
      
      set({
        user: { username: data.username || username },
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const token = authService.getToken();
    if (token) {
      // Você pode decodificar o JWT aqui se quiser
      set({
        isAuthenticated: true,
        user: { username: 'Trainer' }, // Placeholder
      });
    }
  },
}));