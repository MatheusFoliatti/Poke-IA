import { create } from 'zustand';
import api from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pokemon_data?: any;
}

interface ChatStore {
  messages: Message[];
  loading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loading: false,

  sendMessage: async (message: string) => {
    try {
      set({ loading: true });

      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Enviar para API
      const response = await api.post('/api/chat/message', { message });

      // Adicionar resposta do bot
      const botMessage: Message = {
        role: 'assistant',
        content: response.data.bot_response,
        timestamp: response.data.timestamp,
        pokemon_data: response.data.pokemon_data,
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        loading: false,
      }));
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        loading: false,
      }));
    }
  },

  clearHistory: () => {
    set({ messages: [] });
  },

  loadHistory: async () => {
    try {
      const response = await api.get('/api/chat/history');
      
      const formattedMessages: Message[] = response.data.map((msg: any) => ({
        role: msg.is_bot ? 'assistant' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
        pokemon_data: msg.pokemon_data,
      }));

      set({ messages: formattedMessages });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  },
}));