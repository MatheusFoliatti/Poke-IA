import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PokedexClosed from '../UI/PokedexClosed';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // 🔥 Pegue TUDO do store que você precisa
  const { login, error: storeError, isLoading } = useAuthStore((state) => ({
    login: state.login,
    error: state.error,
    isLoading: state.isLoading
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(username, password);
      
      // ✅ Só navega se o login foi bem-sucedido
      navigate('/pokedex');
    } catch (err: any) {
      // O erro já está sendo tratado no store
      console.error('Erro no login:', err);
    }
  };

  return (
    <PokedexClosed>
      <div className="screen-content">
        <h1 className="screen-title">POKÉDEX AI</h1>
        <p className="screen-subtitle">SYSTEM v2.0</p>

        {storeError && <div className="error-message">{storeError}</div>}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">TRAINER ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" disabled={isLoading} className="form-button">
            {isLoading ? '> ACCESSING...' : '> ACCESS SYSTEM'}
          </button>
        </form>

        <p className="form-link-text">
          NEW TRAINER?{' '}
          <a href="/register" className="form-link">REGISTER</a>
        </p>
      </div>
    </PokedexClosed>
  );
}