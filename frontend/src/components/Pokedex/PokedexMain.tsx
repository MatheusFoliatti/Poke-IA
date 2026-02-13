import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Send, Trash2, LogOut, Sparkles } from 'lucide-react';
import MessageBubble from '../Chat/MessageBubble';
import PokedexAnimation from './PokedexAnimation';
import './PokedexMain.css';

export default function PokedexMain() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuthStore();
  const { messages, loading, sendMessage, clearHistory } = useChatStore();

  const suggestions = [
    'Me fale sobre Pikachu',
    'Quais são as stats do Charizard?',
    'Mostre informações sobre Mewtwo',
    'Compare Blastoise e Venusaur',
    'Monte um time balanceado',
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    await sendMessage(message);
    setMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleClearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
      clearHistory();
    }
  };

  if (showAnimation) {
    return <PokedexAnimation onComplete={() => setShowAnimation(false)} />;
  }

  return (
    <div className="pokedex-main-container">
      {/* Sidebar */}
      <aside className="pokedex-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">POKÉDEX AI</h1>
          <p className="sidebar-subtitle">SYSTEM v2.0</p>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-status">● Online</div>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stats-title">Estatísticas</div>
          <div className="stat-item">
            <span className="stat-label">Mensagens</span>
            <span className="stat-value">{messages.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pokémon Consultados</span>
            <span className="stat-value">
              {messages.filter(m => m.pokemon_data).length}
            </span>
          </div>
        </div>

        <div className="sidebar-suggestions">
          <div className="suggestions-title">Sugestões</div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="sidebar-actions">
          <button onClick={handleClearHistory} className="action-button clear">
            <Trash2 size={18} />
            Limpar Histórico
          </button>
          <button onClick={logout} className="action-button logout">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pokedex-main">
        {/* Header */}
        <header className="chat-header">
          <div className="header-content">
            <h2 className="header-title">POKÉDEX AI</h2>
            <p className="header-subtitle">
              Seu assistente inteligente especializado em Pokémon
            </p>
          </div>
        </header>

        {/* Messages Area */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔴</div>
                <h3 className="empty-title">Bem-vindo, Treinador!</h3>
                <p className="empty-subtitle">
                  Pergunte-me sobre qualquer Pokémon para começar
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <MessageBubble 
                    key={`${msg.timestamp}-${index}`} 
                    message={msg} 
                  />
                ))}
                
                {loading && (
                  <div className="loading-container">
                    <div className="loading-avatar">
                      <Sparkles size={20} />
                    </div>
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Pergunte sobre Pokémon..."
              className="message-input"
              disabled={loading}
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !message.trim()}
              className="send-button"
            >
              <Send size={20} />
              Enviar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}