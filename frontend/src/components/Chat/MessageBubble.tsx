import React from 'react';
import PokemonCard from '../Pokemon/PokemonCard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: {
    id?: number;
    // Suporta tanto 'role' (novo) quanto 'is_bot' (legado do banco)
    role?: 'user' | 'assistant';
    is_bot?: boolean;
    content: string;
    timestamp: string;
    pokemon_data?: any;
  };
}

// Normaliza sprite para o formato esperado pelo PokemonCard
function normalizePokemon(pokemon: any) {
  if (!pokemon) return null;

  // Se já tem sprites no formato correto, retorna como está
  if (pokemon.sprites && typeof pokemon.sprites === 'object') {
    return pokemon;
  }

  // Se tem sprite como string direta (formato alternativo), converte
  if (typeof pokemon.sprite === 'string') {
    return {
      ...pokemon,
      sprites: { front_default: pokemon.sprite },
    };
  }

  return pokemon;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Suporta tanto 'role' quanto 'is_bot' para compatibilidade com histórico
  const isBot = message.role === 'assistant' || message.is_bot === true;

  const pokemonData = message.pokemon_data;
  const isComparison = pokemonData?.is_comparison === true;
  const isTeam = pokemonData?.is_team === true;
  const pokemonList: any[] = pokemonData?.pokemon_list ?? [];
  const teamList: any[] = pokemonData?.team_list ?? [];
  const strategy = pokemonData?.strategy;

  return (
    <div className={`message-bubble ${isBot ? 'bot' : 'user'}`}>
      <div className="message-avatar">
        {isBot ? '🤖' : '👤'}
      </div>

      <div className="message-content-wrapper">
        <div className="message-content">
          {message.content}
        </div>

        {/* Equipe de 6 Pokémon */}
        {isTeam && teamList.length > 0 && (
          <div className="pokemon-team-wrapper">
            {strategy && (
              <div className="team-strategy">
                <h3 className="strategy-title">📋 {strategy.title}</h3>
                <p className="strategy-description">{strategy.description}</p>
                <div className="strategy-details">
                  <div className="strategy-section">
                    <h4>🎯 Roles:</h4>
                    <ul>
                      {strategy.roles?.map((role: string, index: number) => (
                        <li key={index}>{role}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="strategy-section">
                    <h4>✅ Pontos Fortes:</h4>
                    <ul>
                      {strategy.strengths?.map((strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className="pokemon-team-grid">
              {teamList.map((pokemon: any, index: number) => {
                const normalized = normalizePokemon(pokemon);
                if (!normalized?.stats) return null;
                return (
                  <div key={`team-${normalized.id ?? index}-${index}`} className="pokemon-team-item">
                    <PokemonCard pokemon={normalized} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparação de 2 Pokémon */}
        {isComparison && pokemonList.length > 0 && (
          <div className="pokemon-comparison-wrapper">
            {pokemonList.map((pokemon: any, index: number) => {
              const normalized = normalizePokemon(pokemon);
              if (!normalized?.stats) return null;
              return (
                <div key={`comparison-${normalized.id ?? index}-${index}`} className="pokemon-comparison-item">
                  <PokemonCard pokemon={normalized} />
                </div>
              );
            })}
          </div>
        )}

        {/* Single Pokémon */}
        {pokemonData && !isComparison && !isTeam && (() => {
          const normalized = normalizePokemon(pokemonData);
          if (!normalized?.stats) return null;
          return (
            <div className="pokemon-card-wrapper">
              <PokemonCard pokemon={normalized} />
            </div>
          );
        })()}

        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MessageBubble);