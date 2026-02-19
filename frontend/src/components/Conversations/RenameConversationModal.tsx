import React, { useState } from 'react';
import { Modal } from '../Modal/Modal';

interface RenameConversationModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export const RenameConversationModal: React.FC<RenameConversationModalProps> = ({
  isOpen,
  currentTitle,
  onClose,
  onRename,
}) => {
  const [title, setTitle] = useState(currentTitle);

  const handleSubmit = () => {
    if (title.trim()) {
      onRename(title.trim());
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renomear Conversa" size="small">
      <div className="modal-form-group">
        <label className="modal-form-label">Novo Nome:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          className="modal-form-input"
          placeholder="Digite o novo nome..."
          autoFocus
          maxLength={50}
        />
      </div>
      <div className="modal-actions">
        <button className="modal-btn modal-btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button 
          className="modal-btn modal-btn-primary" 
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          Renomear
        </button>
      </div>
    </Modal>
  );
};