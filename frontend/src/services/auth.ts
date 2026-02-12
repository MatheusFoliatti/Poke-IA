import api from './api'
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User
} from '@/types'

const TOKEN_KEY = 'access_token'

export const authService = {
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  console.log('🔐 [AUTH] Fazendo login...', credentials.username);
  
  const response = await api.post<AuthResponse>(
    '/auth/login',
    credentials
  )

  console.log('✅ [AUTH] Resposta do backend:', response.data);
  console.log('🎫 [AUTH] Token recebido:', response.data.access_token);

  // 🔐 Salva token automaticamente
  this.saveToken(response.data.access_token)
  
  console.log('💾 [AUTH] Token salvo no localStorage');
  console.log('🔍 [AUTH] Verificando token salvo:', this.getToken());

  return response.data
},

  async register(data: RegisterData): Promise<User> {
    const response = await api.post<User>(
      '/auth/register',
      data
    )

    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY)
  },

  saveToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export default authService
