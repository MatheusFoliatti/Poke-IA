import React from 'react';
import { Conversation } from '../../types/conversation';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  onRename,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-title">
        {conversation.title}
      </div>
      <div className="conversation-info">
        <span className="conversation-count">
          {conversation.message_count}
        </span>
        <span className="conversation-date">
          {formatDate(conversation.updated_at)}
        </span>
      </div>
      <div className="conversation-actions">
        <button 
          className="conversation-action-btn"
          onClick={handleRename}
          title="Renomear"
        >
          ✏️
        </button>
        <button 
          className="conversation-action-btn"
          onClick={handleDelete}
          title="Deletar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};