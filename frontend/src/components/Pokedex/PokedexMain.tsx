import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { useAuthStore } from '../../store/authStore';
import { ConversationsSidebar } from '../Conversations';
import { Conversation } from '../../types/conversation';
import MessageBubble from '../Chat/MessageBubble';
import PokeballLoading from '../Chat/PokeballLoading';
import LoadingConversationModal from '../Modal/LoadingConversationModal';
import SearchModal from '../Modal/SearchModal';
import ComparisonModal from '../Modal/ComparisonModal';
import TeamModal from '../Modal/TeamModal';
import { LogoutModal } from '../Modal/LogoutModal';
import { TeamFilters } from '../Tabs/TeamTab';
import { api } from '../../services/axiosConfig';
import { Pokemon } from '../../types/pokemon';
import './PokedexMain.css';

type LoadingStatus = 'loading' | 'success' | 'error';

export const PokedexMain: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus | null>(null);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isConversationLoading, setIsConversationLoading] = useState(false);

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

  useEffect(() => {
    fetchConversations();
    fetchPokemonList();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      setIsConversationLoading(true);
      loadHistory(activeConversationId).finally(() => {
        setIsConversationLoading(false);
      });
    }
  }, [activeConversationId, loadHistory]);

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

  const isBlocked = loadingStatus === 'loading' || isConversationLoading;

  // Modal de aviso só aparece quando usuário TENTA fazer algo bloqueado
  const [showBlockedWarning, setShowBlockedWarning] = useState(false);
  const showBlockedModal = () => {
    if (!isBlocked) return;
    setShowBlockedWarning(true);
    setTimeout(() => setShowBlockedWarning(false), 2000);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isBlocked) return;

    const messageToSend = inputMessage;
    setInputMessage('');
    setLoadingStatus('loading');

    try {
      await sendMessage(messageToSend, activeConversationId || undefined);
      if (activeConversationId) updateConversationMessageCount(activeConversationId);
      setLoadingStatus('success');
      setTimeout(() => setLoadingStatus(null), 1200);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setLoadingStatus('error');
      setTimeout(() => setLoadingStatus(null), 2000);
    }
  };

  const sendMessageDirectly = async (message: string) => {
    if (!message.trim() || isBlocked) return;

    setLoadingStatus('loading');
    try {
      await sendMessage(message, activeConversationId || undefined);
      if (activeConversationId) updateConversationMessageCount(activeConversationId);
      setLoadingStatus('success');
      setTimeout(() => setLoadingStatus(null), 1200);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setLoadingStatus('error');
      setTimeout(() => setLoadingStatus(null), 2000);
    }
  };

  const handleNewConversation = async (): Promise<Conversation | null> => {
    if (isBlocked) { showBlockedModal(); return null; }
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    clearMessages();
    return await createConversation(`Nova Conversa ${timestamp}`);
  };

  const handleSelectConversation = (id: number) => {
    if (isBlocked) { showBlockedModal(); return; }
    setActiveConversation(id);
  };

  const handleRenameConversation = async (id: number, newTitle: string) => {
    if (isBlocked) { showBlockedModal(); return; }
    await renameConversation(id, newTitle);
  };

  const handleDeleteConversation = async (id: number) => {
    if (isBlocked) { showBlockedModal(); return; }
    const isDeletingActive = id === activeConversationId;
    await deleteConversation(id);
    if (isDeletingActive) {
      clearMessages();
      const remaining = useConversationStore.getState().conversations;
      if (remaining.length === 0) {
        await createConversation('Nova Conversa');
      }
    }
  };

  const openModal = (modal: 'search' | 'comparison' | 'team' | 'logout') => {
    if (isBlocked) { showBlockedModal(); return; }
    setActiveModal(modal);
  };

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

  return (
    <div className="pokedex-main-container">
      {/* Modal de aviso — aparece apenas ao tentar clicar em algo bloqueado */}
      <LoadingConversationModal
        isOpen={showBlockedWarning}
        reason={isConversationLoading ? 'conversation' : 'message'}
      />

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
              <button className="header-btn" onClick={() => openModal('search')} disabled={isBlocked}>
                🔍 Buscar
              </button>
              <button className="header-btn" onClick={() => openModal('comparison')} disabled={isBlocked}>
                ⚔️ Comparar
              </button>
              <button className="header-btn" onClick={() => openModal('team')} disabled={isBlocked}>
                🎯 Equipe
              </button>
            </div>
            <button className="logout-btn" onClick={() => openModal('logout')}>
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
              disabled={isBlocked}
            />
            <button onClick={handleSendMessage} disabled={isBlocked}>
              {loadingStatus === 'loading' ? '...' : 'Enviar'}
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
        disabled={isBlocked}
      />
      <LogoutModal
        isOpen={activeModal === 'logout'}
        onClose={closeModal}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};