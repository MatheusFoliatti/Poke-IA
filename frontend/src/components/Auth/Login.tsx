import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PokedexClosed from '../UI/PokedexClosed';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Navega direto sem delay - a animação acontece na próxima tela
      navigate('/pokedex');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
      setLoading(false);
    }
  };

  return (
    <PokedexClosed>
      <div className="screen-content">
        <h1 className="screen-title">POKEDEX AI</h1>
        <p className="screen-subtitle">SYSTEM v2.0</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">TRAINER ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="form-button">
            {loading ? '> ACCESSING...' : '> ACCESS SYSTEM'}
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