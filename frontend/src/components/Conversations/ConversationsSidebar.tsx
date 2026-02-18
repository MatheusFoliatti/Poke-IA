import React, { useState } from 'react';
import { Conversation } from '../../types/conversation';
import { ConversationItem } from './ConversationItem';
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
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

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
    setRenamingId(conversation.id);
    setRenameValue(conversation.title);
  };

  const handleRenameSubmit = (id: number) => {
    if (renameValue.trim()) {
      onRenameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDeleteClick = (id: number) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    const confirmMsg = `Tem certeza que deseja deletar "${conversation.title}"?\n\nTodas as mensagens serão perdidas.`;
    if (window.confirm(confirmMsg)) {
      onDeleteConversation(id);
    }
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
              renamingId === conversation.id ? (
                <div 
                  key={conversation.id}
                  className="conversation-item active"
                  style={{ padding: '8px' }}
                >
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(conversation.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameSubmit(conversation.id);
                      } else if (e.key === 'Escape') {
                        setRenamingId(null);
                        setRenameValue('');
                      }
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: '4px',
                      color: '#e2e8f0',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              ) : (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === activeConversationId}
                  isHighlighted={conversation.id === highlightId}
                  onClick={() => onSelectConversation(conversation.id)}
                  onRename={() => handleRenameClick(conversation)}
                  onDelete={() => handleDeleteClick(conversation.id)}
                />
              )
            ))}
          </>
        )}
      </div>
    </div>
  );
};