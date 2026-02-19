// src/components/Modal/ComparisonModal.tsx
import { useState } from 'react';
import { Pokemon } from '../../types/pokemon';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';
import './SearchModal.css';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: Pokemon[];
  onCompare: (pokemon1: string, pokemon2: string) => void;
}

export default function ComparisonModal({
  isOpen,
  onClose,
  pokemonList,
  onCompare,
}: ComparisonModalProps) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">⚔️</span>
          <h2 className="modal-title">Comparar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Escolha dois Pokémon para comparar suas stats e descobrir qual é mais forte
          </p>

          <div className="comparison-form-modal">
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
            className="modal-button primary full-width"
            onClick={handleCompare}
            disabled={!pokemon1.trim() || !pokemon2.trim()}
          >
            <span>⚔️</span>
            Comparar Pokémon
          </button>
        </div>
      </div>
    </div>
  );
}