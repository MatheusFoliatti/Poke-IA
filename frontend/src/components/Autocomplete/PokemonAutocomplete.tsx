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

// Formata o nome do Pokémon para exibição
// Ex: "charizard-mega-x" → "Charizard Mega X"
// Ex: "blaziken-mega"    → "Blaziken Mega"
// Ex: "pikachu"          → "Pikachu"
const formatPokemonName = (name: string): string => {
  if (name.includes('-mega')) {
    const parts = name.split('-');
    const baseName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

    if (parts.length === 3) {
      return `${baseName} Mega ${parts[2].toUpperCase()}`;
    } else {
      return `${baseName} Mega`;
    }
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

  // ─────────────────────────────────────────────────────────────
  // Calcula onde a lista de sugestões vai aparecer (acima ou abaixo
  // do input), baseado no espaço disponível na tela.
  // Roda sempre que showSuggestions muda.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceAbove > spaceBelow && spaceAbove > 300) {
        // Mais espaço em cima → mostra acima
        setPosition({
          top: rect.top - 308, // 300px de altura + 8px de gap
          left: rect.left,
          width: rect.width,
        });
      } else {
        // Padrão → mostra abaixo
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    }
  }, [showSuggestions]);

  // ─────────────────────────────────────────────────────────────
  // FILTRO COM DEBOUNCE DE 300ms
  //
  // Sem debounce: filtra os 1350+ Pokémon a cada tecla digitada.
  // Com debounce: espera o usuário parar de digitar por 300ms
  // antes de filtrar. Evita re-renders desnecessários.
  //
  // Como funciona:
  // 1. Usuário digita → setTimeout de 300ms é agendado
  // 2. Usuário digita outra tecla antes de 300ms → clearTimeout
  //    cancela o anterior e agenda um novo
  // 3. Usuário para de digitar → após 300ms o filtro roda
  //
  // O "return () => clearTimeout(timer)" é o cleanup do useEffect:
  // roda automaticamente antes de cada nova execução do efeito.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        const filtered = pokemonList
          .filter((pokemon) => {
            const searchValue = value.toLowerCase();
            const pokemonName = pokemon.name.toLowerCase();
            const formattedName = formatPokemonName(pokemon.name).toLowerCase();

            // Aceita busca pelo nome original ("charizard-mega-x")
            // ou pelo nome formatado ("Charizard Mega X")
            return (
              pokemonName.includes(searchValue) ||
              formattedName.includes(searchValue)
            );
          })
          .slice(0, 8); // Máximo de 8 sugestões visíveis

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        // Menos de 2 caracteres → limpa as sugestões
        setSuggestions([]);
        setShowSuggestions(false);
      }

      setSelectedIndex(-1); // Reseta a seleção por teclado
    }, 300); // ← Debounce de 300ms

    return () => clearTimeout(timer); // ← Cancela o timer anterior
  }, [value, pokemonList]);

  // ─────────────────────────────────────────────────────────────
  // Quando o usuário seleciona um Pokémon (click ou Enter):
  // - Atualiza o valor do input (onChange)
  // - Notifica o pai (onSelect) para que ele envie a busca
  // - Fecha as sugestões
  // ─────────────────────────────────────────────────────────────
  const handleSelect = (pokemonName: string) => {
    onChange(pokemonName);
    onSelect(pokemonName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // ─────────────────────────────────────────────────────────────
  // Navegação por teclado dentro da lista de sugestões:
  // ↓ ArrowDown → próximo item
  // ↑ ArrowUp   → item anterior
  // Enter       → seleciona o item em destaque
  // Escape      → fecha as sugestões
  // ─────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
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

      {/* Lista de sugestões — renderizada com position: fixed para
          não ser cortada por qualquer overflow: hidden dos pais */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="autocomplete-suggestions"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
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
              {/* Sprite do Pokémon com fallback para imagem padrão */}
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
              <span className="pokemon-name">
                {formatPokemonName(pokemon.name)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PokemonAutocomplete;