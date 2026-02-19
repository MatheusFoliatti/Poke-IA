import React, { useState } from 'react';
import { Pokemon } from '../../types/pokemon';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';
import './SearchModal.css';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: Pokemon[];
  onCompare: (pokemon1: string, pokemon2: string) => void;
}

function ComparisonModal({ isOpen, onClose, pokemonList, onCompare }: ComparisonModalProps) {
  const [pokemon1, setPokemon1] = useState('');
  const [pokemon2, setPokemon2] = useState('');

  if (!isOpen) return null;

  const handleCompare = () => {
    if (pokemon1.trim() && pokemon2.trim()) {
      onCompare(pokemon1.trim(), pokemon2.trim());
      onClose();
      setPokemon1('');
      setPokemon2('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const canCompare = pokemon1.trim() && pokemon2.trim();

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container modal-large">

        <div className="modal-header">
          <h2>⚔️ Comparar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* overflow: visible permite os dropdowns do autocomplete aparecerem fora do container */}
        <div className="modal-content" style={{ overflow: 'visible' }}>
          <p className="modal-description">
            Escolha dois Pokémon para comparar suas stats e descobrir qual é mais forte
          </p>

          <div className="comparison-form-modal" style={{ overflow: 'visible' }}>

            <div className="comparison-input-group">
              <label className="input-label">Primeiro Pokémon</label>
              <PokemonAutocomplete
                value={pokemon1}
                onChange={setPokemon1}
                onSelect={setPokemon1}
                placeholder="Ex: Charizard"
                pokemonList={pokemonList}
              />
            </div>

            <div className="vs-divider-modal">
              <span className="vs-text">VS</span>
            </div>

            <div className="comparison-input-group">
              <label className="input-label">Segundo Pokémon</label>
              <PokemonAutocomplete
                value={pokemon2}
                onChange={setPokemon2}
                onSelect={setPokemon2}
                placeholder="Ex: Blastoise"
                pokemonList={pokemonList}
              />
            </div>

          </div>

          <button
            className="modal-btn modal-btn-primary"
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={handleCompare}
            disabled={!canCompare}
          >
            ⚔️ Comparar Pokémon
          </button>
        </div>

      </div>
    </div>
  );
}

export default ComparisonModal;