import React, { useState } from 'react';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';

interface ComparisonTabProps {
  pokemonList: string[];
  onCompare: (pokemon1: string, pokemon2: string) => void;
}

function ComparisonTab({ pokemonList, onCompare }: ComparisonTabProps) {
  const [pokemon1, setPokemon1] = useState('');
  const [pokemon2, setPokemon2] = useState('');

  const handleCompare = () => {
    if (pokemon1.trim() && pokemon2.trim()) {
      onCompare(pokemon1.trim(), pokemon2.trim());
      setPokemon1('');
      setPokemon2('');
    }
  };

  const canCompare = pokemon1.trim() && pokemon2.trim();

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">⚔️ Comparar Pokémon</h2>
        <p className="tab-description">
          Escolha dois Pokémon para comparar suas stats e descobrir qual é mais forte
        </p>
      </div>

      <div className="comparison-form">
        <div className="comparison-inputs">
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

          <div className="vs-divider">
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
          className="compare-button"
          onClick={handleCompare}
          disabled={!canCompare}
        >
          <span>⚔️</span>
          Comparar Pokémon
        </button>
      </div>
    </div>
  );
}

export default ComparisonTab;