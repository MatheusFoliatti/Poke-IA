import { create } from 'zustand'
import { User } from '@/types'
import authService from '@/services/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  login: async (username: string, password: string) => {
  try {
    set({ isLoading: true, error: null })
    
    console.log('🏪 [STORE] Iniciando login...');

    // 1️⃣ Faz login e recebe token
    const authResponse = await authService.login({
      username,
      password
    })
    
    console.log('🏪 [STORE] Login bem-sucedido, token:', authResponse.access_token);

    // 2️⃣ Busca usuário autenticado
    console.log('🏪 [STORE] Buscando dados do usuário...');
    const user = await authService.getCurrentUser()
    
    console.log('🏪 [STORE] Usuário obtido:', user);

    // 3️⃣ Atualiza estado
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    })
    
    console.log('🏪 [STORE] Estado atualizado com sucesso');

  } catch (error: any) {
    console.error('❌ [STORE] Login failed:', error)
    console.error('❌ [STORE] Error details:', error?.response?.data);

    set({
      error:
        error?.response?.data?.detail ||
        'Erro ao fazer login',
      isLoading: false,
      isAuthenticated: false,
      user: null
    })
  }
},

  logout: () => {
    authService.logout()

    set({
      user: null,
      isAuthenticated: false,
      error: null
    })
  },

  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      set({ isLoading: true, error: null })

      const user = await authService.getCurrentUser()

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      })

    } catch (error) {
      console.error('Auth check failed:', error)

      authService.logout()

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Sessão expirada'
      })
    }
  }
}))