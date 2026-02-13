import api from './api';

export const authService = {
  async login(username: string, password: string) {
    // FastAPI OAuth2 espera x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, token_type } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('token_type', token_type);
    
    return { username, access_token, token_type };
  },

  async register(username: string, email: string, password: string) {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
    });

    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};