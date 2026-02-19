import React from 'react';
import { Modal } from '../Modal/Modal';

interface DeleteConversationModalProps {
  isOpen: boolean;
  conversationTitle: string;
  messageCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  isOpen,
  conversationTitle,
  messageCount,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deletar Conversa" size="small">
      <p className="modal-confirm-text">
        Tem certeza que deseja deletar <strong>"{conversationTitle}"</strong>?
      </p>
      <div className="modal-confirm-warning">
        ⚠️ Esta ação não pode ser desfeita. {messageCount} {messageCount === 1 ? 'mensagem será perdida' : 'mensagens serão perdidas'}.
      </div>
      <div className="modal-actions">
        <button className="modal-btn modal-btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
          Deletar
        </button>
      </div>
    </Modal>
  );
};