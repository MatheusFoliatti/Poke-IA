import React from 'react';
import PokemonCard from '../Pokemon/PokemonCard';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    pokemon_data?: any;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isBot = message.role === 'assistant';
  const isComparison = message.pokemon_data?.is_comparison;
  const isTeam = message.pokemon_data?.is_team;
  const pokemonList = message.pokemon_data?.pokemon_list;
  const teamList = message.pokemon_data?.team_list;
  const strategy = message.pokemon_data?.strategy;

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
        {isTeam && teamList && teamList.length > 0 && (
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
              {teamList.map((pokemon: any, index: number) => (
                <div key={`${pokemon.id}-${index}`} className="pokemon-team-item">
                  <PokemonCard pokemon={pokemon} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comparação de múltiplos Pokémon */}
        {isComparison && pokemonList && pokemonList.length > 0 && (
          <div className="pokemon-comparison-wrapper">
            {pokemonList.map((pokemon: any, index: number) => (
              <div key={`${pokemon.id}-${index}`} className="pokemon-comparison-item">
                <PokemonCard pokemon={pokemon} />
              </div>
            ))}
          </div>
        )}
        
        {/* Single Pokémon */}
        {message.pokemon_data && !isComparison && !isTeam && (
          <div className="pokemon-card-wrapper">
            <PokemonCard pokemon={message.pokemon_data} />
          </div>
        )}
        
        <div className="message-time">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(MessageBubble);