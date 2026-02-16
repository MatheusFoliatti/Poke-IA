import { useState, useEffect, useRef } from 'react';
import { Pokemon } from '../../types/pokemon';
import './PokemonAutocomplete.css';

interface PokemonAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (pokemon: string) => void;
  placeholder?: string;
  pokemonList: Pokemon[];
}

// Função para formatar nome de Pokémon (incluindo Megas)
const formatPokemonName = (name: string): string => {
  // Formatar Mega Evolutions
  if (name.includes('-mega')) {
    const parts = name.split('-');
    const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    
    if (parts.length === 3) {
      // Ex: charizard-mega-x → Charizard Mega X
      return `${baseName} Mega ${parts[2].toUpperCase()}`;
    } else {
      // Ex: blaziken-mega → Blaziken Mega
      return `${baseName} Mega`;
    }
  }
  
  // Capitalizar nome normal
  return name.charAt(0).toUpperCase() + name.slice(1);
};

function PokemonAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = "Digite o nome do Pokémon...",
  pokemonList 
}: PokemonAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Pokemon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Calcular posição quando mostrar sugestões
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Se tem mais espaço em cima, mostrar em cima
      if (spaceAbove > spaceBelow && spaceAbove > 300) {
        setPosition({
          top: rect.top - 308, // 300px altura + 8px gap
          left: rect.left,
          width: rect.width
        });
      } else {
        // Mostrar embaixo
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    }
  }, [showSuggestions]);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = pokemonList
        .filter(pokemon => {
          const searchValue = value.toLowerCase();
          const pokemonName = pokemon.name.toLowerCase();
          const formattedName = formatPokemonName(pokemon.name).toLowerCase();
          
          // Buscar tanto no nome original quanto no formatado
          return pokemonName.includes(searchValue) || formattedName.includes(searchValue);
        })
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [value, pokemonList]);

  const handleSelect = (pokemonName: string) => {
    onChange(pokemonName);
    onSelect(pokemonName);
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
          handleSelect(suggestions[selectedIndex].name);
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
        <div 
          ref={suggestionsRef} 
          className="autocomplete-suggestions"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`
          }}
        >
          {suggestions.map((pokemon, index) => (
            <div
              key={pokemon.name}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              data-mega={pokemon.name.includes('-mega') ? 'true' : 'false'}
              onClick={() => handleSelect(pokemon.name)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img 
                src={pokemon.sprite} 
                alt={pokemon.name}
                className="pokemon-sprite"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                  e.currentTarget.style.opacity = '0.5';
                }}
              />
              <span className="pokemon-name">{formatPokemonName(pokemon.name)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PokemonAutocomplete;