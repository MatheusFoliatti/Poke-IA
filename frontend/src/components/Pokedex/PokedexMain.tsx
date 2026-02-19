import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { useAuthStore } from '../../store/authStore';
import { ConversationsSidebar } from '../Conversations';
import { Conversation } from '../../types/conversation';
import { Pokemon } from '../../types/pokemon';
import PokemonCard from '../Pokemon/PokemonCard';
import SearchModal from '../Modal/SearchModal';
import ComparisonModal from '../Modal/ComparisonModal';
import TeamModal from '../Modal/TeamModal';
import { LogoutModal } from '../Modal/LogoutModal';
import { TeamFilters } from '../Tabs/TeamTab';
import { api } from '../../services/axiosConfig';
import './PokedexMain.css';

export const PokedexMain: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // ─── Lista de Pokémon para o autocomplete dos modais ───────────
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);

  // Controle de modais - apenas 1 aberto por vez
  const [activeModal, setActiveModal] = useState<'search' | 'comparison' | 'team' | 'logout' | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Store de chat
  const { messages, sendMessage, loadHistory } = useChatStore();

  // Store de auth
  const logout = useAuthStore((state) => state.logout);

  // Store de conversas
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

  // ─── Carregar conversas e lista de Pokémon ao montar ───────────
  useEffect(() => {
    fetchConversations();
    fetchPokemonList(); // ← adicionado aqui
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
  }, [messages]);

  // ─── Busca a lista de Pokémon da API para o autocomplete ───────
  const fetchPokemonList = async () => {
    try {
      const response = await api.get('/api/chat/pokemon-list');
      setPokemonList(response.data.pokemon || []);
      console.log(`✅ Carregados ${response.data.count} Pokémon para autocomplete`);
    } catch (error) {
      console.error('❌ Erro ao carregar lista de Pokémon:', error);
    }
  };

  // ─── Enviar mensagem via input ──────────────────────────────────
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      await sendMessage(messageToSend, activeConversationId || undefined);

      if (activeConversationId) {
        updateConversationMessageCount(activeConversationId);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Enviar mensagem via modais (buscar, comparar, equipe) ─────
  const sendMessageDirectly = async (message: string) => {
    if (!message.trim()) return;

    setIsTyping(true);

    try {
      await sendMessage(message, activeConversationId || undefined);

      if (activeConversationId) {
        updateConversationMessageCount(activeConversationId);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── Handlers de conversas ─────────────────────────────────────
  const handleNewConversation = async (): Promise<Conversation | null> => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
  };

  // ─── Controle de modais ────────────────────────────────────────
  const openSearchModal = () => setActiveModal('search');
  const openComparisonModal = () => setActiveModal('comparison');
  const openTeamModal = () => setActiveModal('team');
  const openLogoutModal = () => setActiveModal('logout');
  const closeModal = () => setActiveModal(null);

  // ─── Handlers dos modais ───────────────────────────────────────
  const handleSearch = (pokemonName: string) => {
    const message = `Me fale sobre ${pokemonName}`;
    closeModal();
    sendMessageDirectly(message);
  };

  const handleCompare = (pokemon1: string, pokemon2: string) => {
    const message = `Compare ${pokemon1} e ${pokemon2}`;
    closeModal();
    sendMessageDirectly(message);
  };

  const handleGenerateTeam = (filters: TeamFilters) => {
    let message = 'Monte uma equipe';
    if (filters.type) message += ` de ${filters.type}`;
    if (filters.strategy) message += ` ${filters.strategy}`;

    closeModal();
    sendMessageDirectly(message);
  };

  // ─── Handler de logout ─────────────────────────────────────────
  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    closeModal();
  };

  return (
    <div className="pokedex-main-container">

      {/* SIDEBAR DE CONVERSAS */}
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

        {/* Header com botões */}
        <div className="pokedex-header">
          <h1>PokéIA - Assistente Pokémon</h1>
          <div className="header-actions">
            <div className="header-buttons">
              <button
                className="header-btn"
                onClick={openSearchModal}
                title="Buscar Pokémon"
                disabled={isTyping}
              >
                🔍 Buscar
              </button>
              <button
                className="header-btn"
                onClick={openComparisonModal}
                title="Comparar Pokémon"
                disabled={isTyping}
              >
                ⚔️ Comparar
              </button>
              <button
                className="header-btn"
                onClick={openTeamModal}
                title="Montar Equipe"
                disabled={isTyping}
              >
                🎯 Equipe
              </button>
            </div>
            <button
              className="logout-btn"
              onClick={openLogoutModal}
              title="Sair"
            >
              🚪 Sair
            </button>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="chat-area">
          <div className="messages-container" ref={messagesContainerRef}>
            {messages.length === 0 ? (
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
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.is_bot ? 'bot-message' : 'user-message'}`}
                >
                  <div className="message-content">{msg.content}</div>
                  {msg.pokemon_data && (
                    <PokemonCard pokemon={msg.pokemon_data} />
                  )}
                </div>
              ))
            )}

            {isTyping && (
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Input de mensagem */}
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
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODAIS ──────────────────────────────────────────────── */}

      {/* Buscar Pokémon — recebe pokemonList para o PokemonAutocomplete */}
      <SearchModal
        isOpen={activeModal === 'search'}
        onClose={closeModal}
        pokemonList={pokemonList}
        onSearch={handleSearch}
      />

      {/* Comparar Pokémon — recebe pokemonList para o PokemonAutocomplete */}
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
      />

      <LogoutModal
        isOpen={activeModal === 'logout'}
        onClose={closeModal}
        onConfirm={handleLogoutConfirm}
      />

    </div>
  );
};