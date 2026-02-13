import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export interface User {
  id: number;
  username: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('password', password);

          const response = await axios.post(
            'http://localhost:8000/api/auth/login',
            formData,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            }
          );

          console.log('📥 Resposta do login:', response.data);

          // Verificar estrutura da resposta
          if (!response.data || !response.data.access_token || !response.data.user) {
            console.error('❌ Resposta inválida do servidor:', response.data);
            return false;
          }

          const userData: User = {
            id: response.data.user.id,
            username: response.data.user.username,
            token: response.data.access_token,
          };

          set({
            user: userData,
            isAuthenticated: true,
          });

          console.log('✅ Login realizado com sucesso:', userData);
          return true;
        } catch (error: any) {
          console.error('❌ Erro no login:', error);
          if (error.response) {
            console.error('📄 Status:', error.response.status);
            console.error('📄 Data:', error.response.data);
          }
          return false;
        }
      },

      register: async (username: string, password: string) => {
        try {
          await axios.post('http://localhost:8000/api/auth/register', {
            username,
            password,
          });

          console.log('✅ Registro realizado com sucesso');
          return true;
        } catch (error: any) {
          console.error('❌ Erro no registro:', error);
          if (error.response) {
            console.error('📄 Data:', error.response.data);
          }
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        console.log('✅ Logout realizado');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);