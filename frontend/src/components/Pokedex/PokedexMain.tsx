import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { useAuthStore } from '../../store/authStore';
import { ConversationsSidebar } from '../Conversations';
import { Conversation } from '../../types/conversation';
import MessageBubble from '../Chat/MessageBubble';
import PokeballLoading from '../Chat/PokeballLoading';
import SearchModal from '../Modal/SearchModal';
import ComparisonModal from '../Modal/ComparisonModal';
import TeamModal from '../Modal/TeamModal';
import { LogoutModal } from '../Modal/LogoutModal';
import { TeamFilters } from '../Tabs/TeamTab';
import { api } from '../../services/axiosConfig';
import { Pokemon } from '../../types/pokemon';
import './PokedexMain.css';

// Status da pokébola
type LoadingStatus = 'loading' | 'success' | 'error';

export const PokedexMain: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus | null>(null);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  // Controle de modais
  const [activeModal, setActiveModal] = useState<'search' | 'comparison' | 'team' | 'logout' | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { messages, sendMessage, loadHistory, clearMessages } = useChatStore();
  const logout = useAuthStore((state) => state.logout);

  const {
    conversations,
    activeConversationId,
    isLoading: conversationsLoading,
    fetchConversations,
    createConversation,
    setActiveConversation,
    renameConversation,
    deleteConversation,
    updateConversationMessageCount,
  } = useConversationStore();

  // Carregar conversas ao montar
  useEffect(() => {
    fetchConversations();
    fetchPokemonList();
  }, [fetchConversations]);

  // Carregar histórico quando conversa ativa mudar
  useEffect(() => {
    if (activeConversationId) {
      loadHistory(activeConversationId);
    }
  }, [activeConversationId, loadHistory]);

  // Auto-scroll ao adicionar mensagens
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loadingStatus]);

  const fetchPokemonList = async () => {
    try {
      const response = await api.get('/api/chat/pokemon-list');
      setPokemonList(response.data.pokemon || []);
      console.log(`✅ Carregados ${response.data.count} Pokémon para autocomplete`);
    } catch (error) {
      console.error('❌ Erro ao carregar lista de Pokémon:', error);
    }
  };

  // Envia mensagem mostrando imediatamente na tela
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || loadingStatus === 'loading') return;

    const messageToSend = inputMessage;
    setInputMessage('');
    setLoadingStatus('loading');

    try {
      await sendMessage(messageToSend, activeConversationId || undefined);

      if (activeConversationId) {
        updateConversationMessageCount(activeConversationId);
      }

      // Sucesso — mostra verde por 1.2s depois some
      setLoadingStatus('success');
      setTimeout(() => setLoadingStatus(null), 1200);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Erro — mostra vermelho por 2s depois some
      setLoadingStatus('error');
      setTimeout(() => setLoadingStatus(null), 2000);
    }
  };

  // Envia mensagem via modais
  const sendMessageDirectly = async (message: string) => {
    if (!message.trim() || loadingStatus === 'loading') return;

    setLoadingStatus('loading');

    try {
      await sendMessage(message, activeConversationId || undefined);

      if (activeConversationId) {
        updateConversationMessageCount(activeConversationId);
      }

      setLoadingStatus('success');
      setTimeout(() => setLoadingStatus(null), 1200);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setLoadingStatus('error');
      setTimeout(() => setLoadingStatus(null), 2000);
    }
  };

  // Handlers de conversas
  const handleNewConversation = async (): Promise<Conversation | null> => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    clearMessages();
    return await createConversation(`Nova Conversa ${timestamp}`);
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversation(id);
  };

  const handleRenameConversation = async (id: number, newTitle: string) => {
    await renameConversation(id, newTitle);
  };

  const handleDeleteConversation = async (id: number) => {
    await deleteConversation(id);
    clearMessages();

    // Se não sobrou nenhuma conversa, criar uma nova automaticamente
    const remaining = useConversationStore.getState().conversations;
    if (remaining.length === 0) {
      await createConversation('Nova Conversa');
    }
  };

  // Controle de modais
  const openSearchModal = () => setActiveModal('search');
  const openComparisonModal = () => setActiveModal('comparison');
  const openTeamModal = () => setActiveModal('team');
  const openLogoutModal = () => setActiveModal('logout');
  const closeModal = () => setActiveModal(null);

  const handleSearch = (pokemonName: string) => {
    closeModal();
    sendMessageDirectly(`Me fale sobre ${pokemonName}`);
  };

  const handleCompare = (pokemon1: string, pokemon2: string) => {
    closeModal();
    sendMessageDirectly(`Compare ${pokemon1} e ${pokemon2}`);
  };

  const handleGenerateTeam = (filters: TeamFilters) => {
    let message = 'Monte uma equipe';
    if (filters.type) message += ` de ${filters.type}`;
    if (filters.strategy) message += ` ${filters.strategy}`;
    closeModal();
    sendMessageDirectly(message);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    closeModal();
  };

  const isTyping = loadingStatus === 'loading';

  return (
    <div className="pokedex-main-container">
      {/* SIDEBAR */}
      <ConversationsSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={conversationsLoading}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="pokedex-main-content">
        {/* Header */}
        <div className="pokedex-header">
          <h1>PokéIA - Assistente Pokémon</h1>
          <div className="header-actions">
            <div className="header-buttons">
              <button className="header-btn" onClick={openSearchModal} disabled={isTyping}>
                🔍 Buscar
              </button>
              <button className="header-btn" onClick={openComparisonModal} disabled={isTyping}>
                ⚔️ Comparar
              </button>
              <button className="header-btn" onClick={openTeamModal} disabled={isTyping}>
                🎯 Equipe
              </button>
            </div>
            <button className="logout-btn" onClick={openLogoutModal}>
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="chat-area">
          <div className="messages-container" ref={messagesContainerRef}>
            {messages.length === 0 && !loadingStatus ? (
              <div className="welcome-message">
                <h2>👋 Bem-vindo ao PokéIA!</h2>
                <p>Pergunte sobre qualquer Pokémon ou use os botões acima para:</p>
                <ul>
                  <li>🔍 Buscar Pokémon específicos</li>
                  <li>⚔️ Comparar dois Pokémon</li>
                  <li>🎯 Montar equipes balanceadas</li>
                </ul>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble
                  key={`${msg.id ?? index}-${index}`}
                  message={msg}
                />
              ))
            )}

            {/* Pokébola de loading */}
            {loadingStatus && (
              <div className="message-bubble bot" style={{ marginTop: '0.5rem' }}>
                <div className="message-avatar">🤖</div>
                <div className="message-content-wrapper">
                  <PokeballLoading status={loadingStatus} />
                </div>
              </div>
            )}

            <div ref={messagesContainerRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pergunte sobre um Pokémon..."
              disabled={isTyping}
            />
            <button onClick={handleSendMessage} disabled={isTyping}>
              {isTyping ? '...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>

      {/* Modais */}
      <SearchModal
        isOpen={activeModal === 'search'}
        onClose={closeModal}
        pokemonList={pokemonList}
        onSearch={handleSearch}
      />
      <ComparisonModal
        isOpen={activeModal === 'comparison'}
        onClose={closeModal}
        pokemonList={pokemonList}
        onCompare={handleCompare}
      />
      <TeamModal
        isOpen={activeModal === 'team'}
        onClose={closeModal}
        onGenerateTeam={handleGenerateTeam}
        disabled={isTyping}
      />
      <LogoutModal
        isOpen={activeModal === 'logout'}
        onClose={closeModal}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};