import React, { useState } from 'react';
import './SearchModal.css';

interface TeamFilters {
  type?: string;
  strategy?: string;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTeam: (filters: TeamFilters) => void;
  disabled?: boolean;
}

export default function TeamModal({ 
  isOpen, 
  onClose, 
  onGenerateTeam,
  disabled = false 
}: TeamModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');

  if (!isOpen) return null;

  const types = [
    { name: 'Normal', icon: '⭐' },
    { name: 'Fire', icon: '🔥' },
    { name: 'Water', icon: '💧' },
    { name: 'Electric', icon: '⚡' },
    { name: 'Grass', icon: '🌿' },
    { name: 'Ice', icon: '❄️' },
    { name: 'Fighting', icon: '🥊' },
    { name: 'Poison', icon: '☠️' },
    { name: 'Ground', icon: '🏜️' },
    { name: 'Flying', icon: '🦅' },
    { name: 'Psychic', icon: '🔮' },
    { name: 'Bug', icon: '🐛' },
    { name: 'Rock', icon: '🪨' },
    { name: 'Ghost', icon: '👻' },
    { name: 'Dragon', icon: '🐉' },
    { name: 'Dark', icon: '🌑' },
    { name: 'Steel', icon: '⚙️' },
    { name: 'Fairy', icon: '🧚' },
  ];

  const strategies = [
    { name: 'Ofensivo', icon: '⚔️' },
    { name: 'Defensivo', icon: '🛡️' },
    { name: 'Balanceado', icon: '⚖️' },
    { name: 'Velocidade', icon: '💨' },
  ];

  const handleGenerate = () => {
    if (disabled) return;
    
    const filters: TeamFilters = {};
    if (selectedType) filters.type = selectedType;
    if (selectedStrategy) filters.strategy = selectedStrategy;
    
    onGenerateTeam(filters);
    onClose();
    setSelectedType('');
    setSelectedStrategy('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disabled) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container modal-xlarge">
        <div className="modal-header">
          <h2>🎯 Montar Equipe</h2>
          <button className="modal-close" onClick={onClose} disabled={disabled}>
            ✕
          </button>
        </div>
        
        <div className="modal-content modal-body-scrollable">
          <p className="modal-description">
            Escolha um tipo e estratégia para montar a equipe perfeita
          </p>

          <div className="team-form-modal">
            <div className="filter-section">
              <label className="filter-label">Tipo Principal (Opcional)</label>
              <div className="filter-grid-modal">
                {types.map((type) => (
                  <button
                    key={type.name}
                    className={`filter-button-modal ${selectedType === type.name ? 'active' : ''}`}
                    onClick={() => !disabled && setSelectedType(selectedType === type.name ? '' : type.name)}
                    disabled={disabled}
                  >
                    <span className="filter-icon">{type.icon}</span>
                    <span className="filter-text">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Estratégia (Opcional)</label>
              <div className="filter-grid-modal">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.name}
                    className={`filter-button-modal ${selectedStrategy === strategy.name ? 'active' : ''}`}
                    onClick={() => !disabled && setSelectedStrategy(selectedStrategy === strategy.name ? '' : strategy.name)}
                    disabled={disabled}
                  >
                    <span className="filter-icon">{strategy.icon}</span>
                    <span className="filter-text">{strategy.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            className="modal-button primary full-width"
            onClick={handleGenerate}
            disabled={disabled}
          >
            <span className="modal-button-icon">🎯</span>
            {disabled ? 'Processando...' : 'Gerar Equipe'}
          </button>
        </div>
      </div>
    </div>
  );
}