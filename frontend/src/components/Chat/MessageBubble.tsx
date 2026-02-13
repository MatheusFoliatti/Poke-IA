import { User, Bot } from 'lucide-react';
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

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
        <div className={`message-avatar ${isUser ? 'user' : 'assistant'}`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        <div className="message-content">
          {!isUser && message.pokemon_data && (
            <div className="pokemon-context-badge">
              <div className="context-dot"></div>
              <span className="context-text">
                Pokémon: <span className="context-pokemon">{message.pokemon_data.name}</span>
              </span>
            </div>
          )}

          <div className={`message-text ${isUser ? 'user' : 'assistant'}`}>
            <p>{message.content}</p>
          </div>

          {message.pokemon_data && !isUser && (
            <PokemonCard pokemon={message.pokemon_data} />
          )}

          <div className={`message-time ${isUser ? 'user' : 'assistant'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
}