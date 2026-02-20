import React from 'react';
import './LoadingConversationModal.css';

interface LoadingConversationModalProps {
  isOpen: boolean;
  reason?: 'conversation' | 'message';
}

const LoadingConversationModal: React.FC<LoadingConversationModalProps> = ({
  isOpen,
  reason = 'conversation',
}) => {
  if (!isOpen) return null;

  const title = reason === 'message' ? 'Aguardando resposta...' : 'Carregando conversa...';
  const sub = reason === 'message'
    ? 'Não troque de tela até a resposta chegar'
    : 'Aguarde um momento';

  return (
    <div className="loading-conv-overlay">
      <div className="loading-conv-box">
        <div className="loading-conv-pokeball">
          <div className="lcb-top" />
          <div className="lcb-middle"><div className="lcb-button" /></div>
          <div className="lcb-bottom" />
        </div>
        <p className="loading-conv-title">{title}</p>
        <p className="loading-conv-sub">{sub}</p>
      </div>
    </div>
  );
};

export default LoadingConversationModal;