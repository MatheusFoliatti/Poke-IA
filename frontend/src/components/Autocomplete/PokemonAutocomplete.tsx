import React, { useState, useEffect, useRef } from 'react';
import { Pokemon } from '../../types/pokemon';
import './PokemonAutocomplete.css';

interface PokemonAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (pokemon: string) => void;
  placeholder?: string;
  pokemonList: Pokemon[];
}

const formatPokemonName = (name: string): string => {
  if (name.includes('-mega')) {
    const parts = name.split('-');
    const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    if (parts.length === 3) {
      return `${baseName} Mega ${parts[2].toUpperCase()}`;
    }
    return `${baseName} Mega`;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

function PokemonAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Digite o nome do Pokémon...',
  pokemonList,
}: PokemonAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Pokemon[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Recalcula posição do dropdown (position:fixed) sempre que abre
  // Também ouve resize e scroll para manter posição correta dentro de modais
  useEffect(() => {
    const updatePosition = () => {
      if (showSuggestions && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceAbove > spaceBelow && spaceAbove > 300) {
          setPosition({ top: rect.top - 308, left: rect.left, width: rect.width });
        } else {
          setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showSuggestions]);

  // Filtro com debounce de 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        const filtered = pokemonList
          .filter((pokemon) => {
            const search = value.toLowerCase();
            return (
              pokemon.name.toLowerCase().includes(search) ||
              formatPokemonName(pokemon.name).toLowerCase().includes(search)
            );
          })
          .slice(0, 8);
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, pokemonList]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) handleSelect(suggestions[selectedIndex].name);
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
        onFocus={() => {
          if (value.length >= 2 && suggestions.length > 0) setShowSuggestions(true);
        }}
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
            width: `${position.width}px`,
            zIndex: 99999,
          }}
        >
          {suggestions.map((pokemon, index) => (
            <div
              key={pokemon.name}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              data-mega={pokemon.name.includes('-mega') ? 'true' : 'false'}
              onMouseDown={(e) => {
                e.preventDefault(); // evita blur antes do clique
                handleSelect(pokemon.name);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="pokemon-sprite"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
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