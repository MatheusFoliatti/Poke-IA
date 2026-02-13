import { create } from 'zustand';
import axios from 'axios';
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

    // Adicionar mensagem do usuário
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
      const response = await axios.post(
        'http://localhost:8000/api/chat/message',
        { message },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

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
      await axios.delete('http://localhost:8000/api/chat/history', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

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
      const response = await axios.get('http://localhost:8000/api/chat/history', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

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