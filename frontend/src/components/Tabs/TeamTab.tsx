import { useState } from 'react';

interface TeamTabProps {
  onGenerateTeam: (filters: TeamFilters) => void;
}

export interface TeamFilters {
  type?: string;
  strategy?: string;
}

function TeamTab({ onGenerateTeam }: TeamTabProps) {
  const [selectedType, setSelectedType] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');

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
  };

  return (
    <div className="tab-content">
      <div className="team-form">
        <div className="filter-section">
          <label className="filter-label">Tipo</label>
          <div className="filter-grid">
            {types.map(type => (
              <button
                key={type.value}
                className={`filter-button ${selectedType === type.value ? 'active' : ''}`}
                onClick={() => setSelectedType(type.value)}
              >
                <span className="filter-icon">{type.icon}</span>
                <span className="filter-text">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">Estratégia</label>
          <div className="filter-grid">
            {strategies.map(strategy => (
              <button
                key={strategy.value}
                className={`filter-button ${selectedStrategy === strategy.value ? 'active' : ''}`}
                onClick={() => setSelectedStrategy(strategy.value)}
              >
                <span className="filter-icon">{strategy.icon}</span>
                <span className="filter-text">{strategy.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          className="generate-team-button"
          onClick={handleGenerate}
        >
          <span>🎯</span>
          Gerar Equipe
        </button>
      </div>
    </div>
  );
}

export default TeamTab;