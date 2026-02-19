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
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

          if (!response.data || !response.data.access_token || !response.data.user) {
            console.error('❌ Resposta inválida do servidor:', response.data);
            return false;
          }

          const userData: User = {
            id: response.data.user.id,
            username: response.data.user.username,
            token: response.data.access_token,
          };

          // Salvar no localStorage para o api.ts
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('token_type', response.data.token_type || 'bearer');

          set({
            user: userData,
            isAuthenticated: true,
          });

          console.log('✅ Login realizado com sucesso:', userData);
          console.log('✅ Token salvo no localStorage');
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
        // Limpar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        
        set({
          user: null,
          isAuthenticated: false,
        });
        console.log('✅ Logout realizado');
      },

      updateToken: (token: string) => {
        const currentUser = get().user;
        if (currentUser) {
          // Atualizar localStorage também
          localStorage.setItem('token', token);
          
          set({
            user: {
              ...currentUser,
              token: token,
            },
          });
          console.log('✅ Token atualizado no store e localStorage');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);