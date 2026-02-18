import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import { useConversationStore } from '../../store/conversationStore';
import { useAuthStore } from '../../store/authStore';
import { ConversationsSidebar } from '../Conversations';
import { Conversation } from '../../types/conversation';
import PokemonCard from '../Pokemon/PokemonCard';
import SearchModal from '../Modal/SearchModal';
import ComparisonModal from '../Modal/ComparisonModal';
import TeamModal from '../Modal/TeamModal';
import { TeamFilters } from '../Tabs/TeamTab';
import './PokedexMain.css';

export const PokedexMain: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  
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

  // Carregar conversas ao montar componente
  useEffect(() => {
    fetchConversations();
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

  // Enviar mensagem
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

  // Handlers de conversas
  const handleNewConversation = async (): Promise<Conversation | null> => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
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

  // Handler de logout
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/login');
    }
  };

  // Handlers dos modais
  const handleSearch = async (pokemonName: string) => {
    setInputMessage(`Me fale sobre ${pokemonName}`);
    setShowSearchModal(false);
    await handleSendMessage();
  };

  const handleCompare = async (pokemon1: string, pokemon2: string) => {
    setInputMessage(`Compare ${pokemon1} e ${pokemon2}`);
    setShowComparisonModal(false);
    await handleSendMessage();
  };

  const handleGenerateTeam = async (filters: TeamFilters) => {
    let message = 'Monte uma equipe';
    if (filters.type) message += ` de ${filters.type}`;
    if (filters.strategy) message += ` ${filters.strategy}`;
    
    setInputMessage(message);
    setShowTeamModal(false);
    await handleSendMessage();
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
                onClick={() => setShowSearchModal(true)}
                title="Buscar Pokémon"
              >
                🔍 Buscar
              </button>
              <button
                className="header-btn"
                onClick={() => setShowComparisonModal(true)}
                title="Comparar Pokémon"
              >
                ⚔️ Comparar
              </button>
              <button
                className="header-btn"
                onClick={() => setShowTeamModal(true)}
                title="Montar Equipe"
              >
                🎯 Equipe
              </button>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
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

        {/* Modais */}
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          pokemonList={[]}
          onSearch={handleSearch}
        />
        
        <ComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          pokemonList={[]}
          onCompare={handleCompare}
        />
        
        <TeamModal
          isOpen={showTeamModal}
          onClose={() => setShowTeamModal(false)}
          onGenerateTeam={handleGenerateTeam}
        />
      </div>
    </div>
  );
};