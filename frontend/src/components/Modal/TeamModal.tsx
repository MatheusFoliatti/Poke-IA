import { useState } from 'react';
import { TeamFilters } from '../Tabs/TeamTab';
import './SearchModal.css';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateTeam: (filters: TeamFilters) => void;
}

function TeamModal({ isOpen, onClose, onGenerateTeam }: TeamModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');

  if (!isOpen) return null;

  const types = [
    { value: '', label: 'Todos', icon: '🌈' },
    { value: 'fire', label: 'Fogo', icon: '🔥' },
    { value: 'water', label: 'Água', icon: '💧' },
    { value: 'grass', label: 'Grama', icon: '🌿' },
    { value: 'electric', label: 'Elétrico', icon: '⚡' },
    { value: 'psychic', label: 'Psíquico', icon: '🔮' },
    { value: 'dragon', label: 'Dragão', icon: '🐉' },
    { value: 'ghost', label: 'Fantasma', icon: '👻' },
    { value: 'ice', label: 'Gelo', icon: '❄️' },
    { value: 'fighting', label: 'Lutador', icon: '🥊' },
    { value: 'dark', label: 'Sombrio', icon: '🌑' },
    { value: 'steel', label: 'Metálico', icon: '⚙️' },
    { value: 'fairy', label: 'Fada', icon: '🧚' },
    { value: 'rock', label: 'Pedra', icon: '🪨' },
    { value: 'ground', label: 'Terra', icon: '🌍' },
    { value: 'flying', label: 'Voador', icon: '🕊️' },
  ];

  const strategies = [
    { value: '', label: 'Balanceada', icon: '⚖️' },
    { value: 'offensive', label: 'Ofensiva', icon: '⚔️' },
    { value: 'tank', label: 'Defensiva', icon: '🛡️' },
    { value: 'speed', label: 'Velocidade', icon: '⚡' },
  ];

  const handleGenerate = () => {
    const filters: TeamFilters = {};
    if (selectedType) filters.type = selectedType;
    if (selectedStrategy) filters.strategy = selectedStrategy;
    onGenerateTeam(filters);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🎯</span>
          <h2 className="modal-title">Montar Equipe</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body modal-body-scrollable">
          <p className="modal-description">
            Crie uma equipe balanceada de 6 Pokémon totalmente evoluídos com base em tipo e estratégia
          </p>
          
          <div className="team-form-modal">
            <div className="filter-section">
              <label className="filter-label">🌈 Tipo de Pokémon</label>
              <div className="filter-grid-modal">
                {types.map(type => (
                  <button
                    key={type.value}
                    className={`filter-button-modal ${selectedType === type.value ? 'active' : ''}`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <span className="filter-icon">{type.icon}</span>
                    <span className="filter-text">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">🎯 Estratégia de Batalha</label>
              <div className="filter-grid-modal">
                {strategies.map(strategy => (
                  <button
                    key={strategy.value}
                    className={`filter-button-modal ${selectedStrategy === strategy.value ? 'active' : ''}`}
                    onClick={() => setSelectedStrategy(strategy.value)}
                  >
                    <span className="filter-icon">{strategy.icon}</span>
                    <span className="filter-text">{strategy.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            className="modal-button primary full-width"
            onClick={handleGenerate}
          >
            <span>🎯</span>
            Gerar Equipe Aleatória
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamModal;