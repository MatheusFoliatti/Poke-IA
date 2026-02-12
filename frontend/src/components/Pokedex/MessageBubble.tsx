import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { Message } from '@/types';
import PokemonCard from './PokemonCard';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Extrair dados do Pokémon se houver (pode vir do backend)
  const pokemonData = (message as any).pokemon_data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-red-500 to-red-600'
        } shadow-lg`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-3">
          {/* Mensagem de texto */}
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            
            {/* Timestamp */}
            <p className={`text-xs mt-2 ${
              isUser ? 'text-blue-200' : 'text-slate-500'
            }`}>
              {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* Card do Pokémon (se houver dados) */}
          {!isUser && pokemonData && (
            <PokemonCard pokemon={pokemonData} />
          )}

          {/* Badge de contexto Pokémon */}
          {message.pokemon_context && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full w-fit">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">
                Sobre: <span className="font-semibold capitalize">{message.pokemon_context}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;