import { useState, useEffect, useRef } from 'react';
import { Pokemon } from '../../types/pokemon';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import MessageBubble from '../Chat/MessageBubble';
import TabNavigation, { TabType } from '../Tabs/TabNavigation';
import SearchTab from '../Tabs/SearchTab';
import ComparisonTab from '../Tabs/ComparisonTab';
import TeamTab, { TeamFilters } from '../Tabs/TeamTab';
import ConfirmModal from '../Modal/ConfirmModal';
import { api } from '../../services/axiosConfig';
import './PokedexMain.css';
import '../Tabs/Tabs.css';

function PokedexMain() {
  const { messages, isLoading, sendMessage, clearHistory, loadHistory } = useChatStore();
  const { user, logout } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  
  // Estados para modais
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Carregar histórico ao montar
  useEffect(() => {
    loadHistory();
    fetchPokemonList();
  }, []);

  // Auto-scroll ao adicionar mensagens
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPokemonList = async () => {
    try {
      const response = await api.get('/api/chat/pokemon-list');
      setPokemonList(response.data.pokemon || []);
      console.log(`✅ Carregados ${response.data.count} Pokémon para autocomplete`);
    } catch (error) {
      console.error('❌ Erro ao carregar lista de Pokémon:', error);
    }
  };

  const handleSearch = (pokemon: string) => {
    sendMessage(`Me fale sobre ${pokemon}`);
  };

  const handleCompare = (pokemon1: string, pokemon2: string) => {
    sendMessage(`Compare ${pokemon1} e ${pokemon2}`);
  };

  const handleGenerateTeam = (filters: TeamFilters) => {
    let message = 'Monte uma equipe';
    if (filters.type) {
      message += ` de ${filters.type}`;
    }
    if (filters.strategy) {
      message += ` ${filters.strategy}`;
    }
    sendMessage(message);
  };

  const handleClearHistory = async () => {
    setShowClearModal(false);
    await clearHistory();
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchTab pokemonList={pokemonList} onSearch={handleSearch} />;
      case 'comparison':
        return <ComparisonTab pokemonList={pokemonList} onCompare={handleCompare} />;
      case 'team':
        return <TeamTab onGenerateTeam={handleGenerateTeam} />;
      default:
        return null;
    }
  };

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
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'Usuário'}</div>
            <div className="user-status">● Online</div>
          </div>
        </div>

        <div className="sidebar-stats">
          <div className="stats-title">ESTATÍSTICAS</div>
          <div className="stat-item">
            <span className="stat-label">Mensagens</span>
            <span className="stat-value">{messages.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pokémon Consultados</span>
            <span className="stat-value">
              {messages.filter(m => m.pokemon_data && !m.pokemon_data.is_comparison && !m.pokemon_data.is_team).length}
            </span>
          </div>
        </div>

        <div className="sidebar-suggestions">
          <div className="suggestions-title">SUGESTÕES</div>
          <button className="suggestion-item" onClick={() => handleSearch('pikachu')}>
            Me fale sobre Pikachu
          </button>
          <button className="suggestion-item" onClick={() => handleCompare('charizard', 'blastoise')}>
            Compare Charizard e Blastoise
          </button>
          <button className="suggestion-item" onClick={() => handleGenerateTeam({})}>
            Monte uma equipe balanceada
          </button>
          <button className="suggestion-item" onClick={() => handleGenerateTeam({ type: 'dragon' })}>
            Time de dragões
          </button>
        </div>

        <div className="sidebar-actions">
          <button className="action-button clear" onClick={() => setShowClearModal(true)}>
            🗑️ Limpar Histórico
          </button>
          <button className="action-button logout" onClick={() => setShowLogoutModal(true)}>
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pokedex-main">
        {/* Header com Abas */}
        <div className="chat-header">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Conteúdo da Aba Ativa */}
        {renderTabContent()}

        {/* Área de Mensagens */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔴</div>
                <h3 className="empty-title">Nenhuma conversa ainda</h3>
                <p className="empty-subtitle">
                  Use as abas acima para buscar Pokémon, comparar ou montar equipes!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble key={`${msg.timestamp}-${index}`} message={msg} />
              ))
            )}

            {isLoading && (
              <div className="loading-container">
                <div className="loading-avatar">🤖</div>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Modais de Confirmação */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Limpar Histórico"
        message="Tem certeza que deseja limpar todo o histórico de conversas? Esta ação não pode ser desfeita."
        confirmText="Sim, Limpar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearModal(false)}
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Sair da Conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema."
        confirmText="Sim, Sair"
        cancelText="Cancelar"
        type="warning"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}

export default PokedexMain;