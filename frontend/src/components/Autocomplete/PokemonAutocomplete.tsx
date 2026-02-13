import React, { useState, useEffect, useRef } from 'react';
import './PokemonAutocomplete.css';

interface PokemonAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (pokemon: string) => void;
  placeholder?: string;
  pokemonList: string[];
}

function PokemonAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Digite o nome do Pokémon...",
  pokemonList 
}: PokemonAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = pokemonList
        .filter(pokemon => pokemon.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [value, pokemonList]);

  const handleSelect = (pokemon: string) => {
    onChange(pokemon);
    onSelect(pokemon);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="autocomplete-input"
        autoComplete="off"
      />
      
      {showSuggestions && (
        <div ref={suggestionsRef} className="autocomplete-suggestions">
          {suggestions.map((pokemon, index) => (
            <div
              key={pokemon}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(pokemon)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="pokemon-name">{pokemon}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PokemonAutocomplete;