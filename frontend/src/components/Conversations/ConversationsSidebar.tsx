import React, { useState } from 'react';
import { Conversation } from '../../types/conversation';
import { ConversationItem } from './ConversationItem';
import { RenameConversationModal } from './RenameConversationModal';
import { DeleteConversationModal } from './DeleteConversationModal';
import './Conversations.css';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  isLoading: boolean;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => Promise<Conversation | null>;
  onRenameConversation: (id: number, newTitle: string) => void;
  onDeleteConversation: (id: number) => void;
}

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  conversations,
  activeConversationId,
  isLoading,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  // Estados dos modais
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleNewConversation = async () => {
    const result = await onNewConversation();
    
    // Se retornou conversa existente (não criou nova)
    if (result) {
      const existingEmpty = conversations.find(
        conv => conv.id === result.id && conv.message_count === 0
      );
      
      if (existingEmpty && existingEmpty.id === result.id) {
        // É uma conversa vazia existente, destacar
        setHighlightId(result.id);
        setShowToast(true);
        
        // Remover destaque após 2s
        setTimeout(() => {
          setHighlightId(null);
        }, 2000);
        
        // Remover toast após 3s
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    }
  };

  const handleRenameClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = (newTitle: string) => {
    if (selectedConversation) {
      onRenameConversation(selectedConversation.id, newTitle);
    }
    setRenameModalOpen(false);
    setSelectedConversation(null);
  };

  const handleDeleteClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedConversation) {
      onDeleteConversation(selectedConversation.id);
    }
    setDeleteModalOpen(false);
    setSelectedConversation(null);
  };

  return (
    <div className="conversations-sidebar">
      <div className="conversations-header">
        <h2>Conversas</h2>
        <button 
          className="new-conversation-btn"
          onClick={handleNewConversation}
        >
          <span>➕</span>
          <span>Nova Conversa</span>
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="conversation-toast">
          ℹ️ Você já tem uma conversa vazia. Use esta ou envie mensagens para criar outra!
        </div>
      )}

      <div className="conversations-list">
        {isLoading ? (
          <div className="conversations-loading">
            <div className="conversations-loading-spinner">⏳</div>
            <p>Carregando conversas...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="conversations-empty">
            <div className="conversations-empty-icon">💬</div>
            <p className="conversations-empty-text">
              Nenhuma conversa ainda.<br />
              Clique em "Nova Conversa" para começar!
            </p>
          </div>
        ) : (
          <>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                isHighlighted={conversation.id === highlightId}
                onClick={() => onSelectConversation(conversation.id)}
                onRename={() => handleRenameClick(conversation)}
                onDelete={() => handleDeleteClick(conversation)}
              />
            ))}
          </>
        )}
      </div>

      {/* Modais */}
      {selectedConversation && (
        <>
          <RenameConversationModal
            isOpen={renameModalOpen}
            currentTitle={selectedConversation.title}
            onClose={() => setRenameModalOpen(false)}
            onRename={handleRenameSubmit}
          />
          
          <DeleteConversationModal
            isOpen={deleteModalOpen}
            conversationTitle={selectedConversation.title}
            messageCount={selectedConversation.message_count}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
};