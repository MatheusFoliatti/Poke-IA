import React, { useState } from 'react';
import { Pokemon } from '../../types/pokemon';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: Pokemon[];
  onSearch: (pokemon: string) => void;
}

function SearchModal({ isOpen, onClose, pokemonList, onSearch }: SearchModalProps) {
  const [searchValue, setSearchValue] = useState('');

  if (!isOpen) return null;

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      onClose();
      setSearchValue('');
    }
  };

  const handleSelect = (pokemon: string) => {
    onSearch(pokemon);
    onClose();
    setSearchValue('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container modal-large">

        <div className="modal-header">
          <h2>🔍 Buscar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* overflow: visible permite o dropdown do autocomplete aparecer fora do container */}
        <div className="modal-content" style={{ overflow: 'visible' }}>
          <p className="modal-description">
            Digite o nome de qualquer Pokémon para ver suas informações completas
          </p>

          <div className="search-form-modal" style={{ overflow: 'visible' }}>
            <PokemonAutocomplete
              value={searchValue}
              onChange={setSearchValue}
              onSelect={handleSelect}
              placeholder="Ex: pikachu, charizard, rayquaza..."
              pokemonList={pokemonList}
            />
            <button
              className="modal-btn modal-btn-primary"
              onClick={handleSearch}
              disabled={!searchValue.trim()}
            >
              🔍 Buscar Pokémon
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SearchModal;