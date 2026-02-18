import React, { useState } from 'react';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemonList: string[];
  onSearch: (pokemonName: string) => void;
}

export default function SearchModal({ 
  isOpen, 
  onClose, 
  pokemonList, 
  onSearch 
}: SearchModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSearch = (value: string) => {
    setSearchValue(value);
    
    if (value.trim() === '') {
      setFilteredPokemon([]);
      return;
    }

    // Filtrar Pokémon
    const filtered = pokemonList
      .filter(pokemon => 
        pokemon.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 50); // Limitar a 50 resultados

    setFilteredPokemon(filtered);
  };

  const handleSelectPokemon = (pokemon: string) => {
    onSearch(pokemon);
    onClose();
    setSearchValue('');
    setFilteredPokemon([]);
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
          <h2>🔍 Buscar Pokémon</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <p className="modal-description">
            Digite o nome do Pokémon que você deseja conhecer
          </p>

          <div className="search-form-modal">
            <div className="search-input-group">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Ex: Pikachu, Charizard, Mewtwo..."
                className="search-input"
                autoFocus
              />
              <span className="search-icon">🔍</span>
            </div>

            {searchValue && (
              <div className="search-suggestions">
                {filteredPokemon.length > 0 ? (
                  filteredPokemon.map((pokemon, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSelectPokemon(pokemon)}
                    >
                      <span className="suggestion-icon">⚡</span>
                      <span style={{ textTransform: 'capitalize' }}>{pokemon}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-no-results">
                    <div className="search-no-results-icon">😕</div>
                    <div className="search-no-results-text">
                      Nenhum Pokémon encontrado com "{searchValue}"
                    </div>
                  </div>
                )}
              </div>
            )}

            {!searchValue && (
              <div className="search-no-results">
                <div className="search-no-results-icon">🔎</div>
                <div className="search-no-results-text">
                  Comece digitando o nome de um Pokémon
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}