import { create } from 'zustand';
import { api } from '../services/axiosConfig';  // ← Usar instância configurada
import { useAuthStore } from './authStore';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pokemon_data?: any;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (message: string) => {
    const { user } = useAuthStore.getState();

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const response = await api.post('/api/chat/message', { message });

      const botMessage: Message = {
        role: 'assistant',
        content: response.data.bot_response,
        timestamp: response.data.timestamp,
        pokemon_data: response.data.pokemon_data,
      };

      set((state) => ({
        messages: [...state.messages, botMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. 😞',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

  clearHistory: async () => {
    const { user } = useAuthStore.getState();

    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    try {
      await api.delete('/api/chat/history');
      set({ messages: [] });
      console.log('✅ Histórico limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
    }
  },

  loadHistory: async () => {
    const { user } = useAuthStore.getState();

    if (!user) {
      return;
    }

    try {
      const response = await api.get('/api/chat/history');

      const history = response.data.messages || [];
      const formattedMessages: Message[] = history.map((msg: any) => ({
        role: msg.is_bot ? 'assistant' : 'user',
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      set({ messages: formattedMessages });
      console.log(`✅ Histórico carregado: ${formattedMessages.length} mensagens`);
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  },
}));