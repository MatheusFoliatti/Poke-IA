import React from 'react';
import { Modal } from './Modal';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sair da Conta" size="small">
      <p className="modal-confirm-text">
        Tem certeza que deseja sair?
      </p>
      <p className="modal-confirm-text" style={{ fontSize: '13px', opacity: 0.8 }}>
        Você precisará fazer login novamente para acessar o PokéIA.
      </p>
      <div className="modal-actions">
        <button className="modal-btn modal-btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
          Sair
        </button>
      </div>
    </Modal>
  );
};