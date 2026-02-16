import { useState } from 'react';
import { Pokemon } from '../../types/pokemon';
import PokemonAutocomplete from '../Autocomplete/PokemonAutocomplete';

interface SearchTabProps {
  pokemonList: Pokemon[];
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
      <div className="search-form">
        <PokemonAutocomplete
          value={searchValue}
          onChange={setSearchValue}
          onSelect={handleSelect}
          placeholder="Digite o nome do Pokémon..."
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