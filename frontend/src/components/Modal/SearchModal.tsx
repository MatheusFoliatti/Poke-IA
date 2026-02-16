import { useState } from 'react';
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
    }
  };

  const handleSelect = (pokemon: string) => {
    setSearchValue(pokemon);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">🔍</span>
          <h2 className="modal-title">Buscar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Digite o nome de qualquer Pokémon para ver suas informações completas
          </p>
          
          <div className="search-form-modal">
            <PokemonAutocomplete
              value={searchValue}
              onChange={setSearchValue}
              onSelect={handleSelect}
              placeholder="Ex: pikachu, charizard, rayquaza..."
              pokemonList={pokemonList}
            />
            <button 
              className="modal-button primary"
              onClick={handleSearch}
              disabled={!searchValue.trim()}
            >
              <span>🔍</span>
              Buscar Pokémon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;