import React, { useState } from 'react';
import './SearchModal.css';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: string[];
  onCompare: (pokemon1: string, pokemon2: string) => void;
}

export default function ComparisonModal({ 
  isOpen, 
  onClose, 
  pokemonList, 
  onCompare 
}: ComparisonModalProps) {
  const [pokemon1, setPokemon1] = useState('');
  const [pokemon2, setPokemon2] = useState('');
  const [suggestions1, setSuggestions1] = useState<string[]>([]);
  const [suggestions2, setSuggestions2] = useState<string[]>([]);
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  if (!isOpen) return null;

  const handleSearch1 = (value: string) => {
    setPokemon1(value);
    
    if (value.trim() === '') {
      setSuggestions1([]);
      return;
    }

    const filtered = pokemonList
      .filter(pokemon => pokemon.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10);
    
    setSuggestions1(filtered);
    setShowSuggestions1(true);
  };

  const handleSearch2 = (value: string) => {
    setPokemon2(value);
    
    if (value.trim() === '') {
      setSuggestions2([]);
      return;
    }

    const filtered = pokemonList
      .filter(pokemon => pokemon.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10);
    
    setSuggestions2(filtered);
    setShowSuggestions2(true);
  };

  const handleSelect1 = (pokemon: string) => {
    setPokemon1(pokemon);
    setShowSuggestions1(false);
  };

  const handleSelect2 = (pokemon: string) => {
    setPokemon2(pokemon);
    setShowSuggestions2(false);
  };

  const handleCompare = () => {
    if (pokemon1.trim() && pokemon2.trim()) {
      onCompare(pokemon1.trim(), pokemon2.trim());
      onClose();
      setPokemon1('');
      setPokemon2('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2>⚔️ Comparar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <p className="modal-description">
            Escolha dois Pokémon para comparar seus stats, tipos e habilidades
          </p>

          <div className="comparison-form-modal">
            {/* Pokémon 1 */}
            <div className="comparison-input-group">
              <label className="input-label">Pokémon 1</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={pokemon1}
                  onChange={(e) => handleSearch1(e.target.value)}
                  onFocus={() => setShowSuggestions1(true)}
                  placeholder="Ex: Charizard"
                  className="comparison-input"
                />
                {showSuggestions1 && suggestions1.length > 0 && (
                  <div className="search-suggestions" style={{ position: 'absolute', top: '100%', width: '100%', zIndex: 10, marginTop: '4px' }}>
                    {suggestions1.map((pokemon, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSelect1(pokemon)}
                      >
                        <span className="suggestion-icon">⚡</span>
                        <span style={{ textTransform: 'capitalize' }}>{pokemon}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* VS Divider */}
            <div className="vs-divider-modal">
              <span className="vs-text">VS</span>
            </div>

            {/* Pokémon 2 */}
            <div className="comparison-input-group">
              <label className="input-label">Pokémon 2</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={pokemon2}
                  onChange={(e) => handleSearch2(e.target.value)}
                  onFocus={() => setShowSuggestions2(true)}
                  placeholder="Ex: Blastoise"
                  className="comparison-input"
                />
                {showSuggestions2 && suggestions2.length > 0 && (
                  <div className="search-suggestions" style={{ position: 'absolute', top: '100%', width: '100%', zIndex: 10, marginTop: '4px' }}>
                    {suggestions2.map((pokemon, index) => (
                      <div
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSelect2(pokemon)}
                      >
                        <span className="suggestion-icon">⚡</span>
                        <span style={{ textTransform: 'capitalize' }}>{pokemon}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            className="modal-button primary full-width"
            onClick={handleCompare}
            disabled={!pokemon1.trim() || !pokemon2.trim()}
          >
            <span className="modal-button-icon">⚔️</span>
            Comparar Pokémon
          </button>
        </div>
      </div>
    </div>
  );
}