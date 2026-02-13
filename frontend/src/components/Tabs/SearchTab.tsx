import React, { useState } from 'react';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';

interface SearchTabProps {
  pokemonList: string[];
  onSearch: (pokemon: string) => void;
}

function SearchTab({ pokemonList, onSearch }: SearchTabProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchValue('');
    }
  };

  const handleSelect = (pokemon: string) => {
    onSearch(pokemon);
    setSearchValue('');
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2 className="tab-title">🔍 Buscar Pokémon</h2>
        <p className="tab-description">
          Digite o nome de qualquer Pokémon para ver suas informações completas
        </p>
      </div>

      <div className="search-form">
        <PokemonAutocomplete
          value={searchValue}
          onChange={setSearchValue}
          onSelect={handleSelect}
          placeholder="Digite o nome do Pokémon (ex: pikachu, charizard...)"
          pokemonList={pokemonList}
        />
        <button 
          className="search-button"
          onClick={handleSearch}
          disabled={!searchValue.trim()}
        >
          <span>🔍</span>
          Buscar
        </button>
      </div>
    </div>
  );
}

export default SearchTab;