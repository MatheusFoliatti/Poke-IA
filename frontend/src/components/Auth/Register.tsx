import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import PokedexClosed from '../UI/PokedexClosed';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register(username, email, password);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PokedexClosed>
      <div className="screen-content register-screen">
        <h1 className="screen-title">NEW TRAINER</h1>
        <p className="screen-subtitle">REGISTRATION</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-group">
            <label className="form-label">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
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
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="form-button">
            {loading ? '> REGISTERING...' : '> CREATE TRAINER'}
          </button>
        </form>

        <p className="form-link-text">
          HAVE ACCOUNT?{' '}
          <a href="/login" className="form-link">LOGIN</a>
        </p>
      </div>
    </PokedexClosed>
  );
}