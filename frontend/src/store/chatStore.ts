import { create } from 'zustand';
import { Message, ChatResponse } from '@/types';
import api from '@/services/api';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  suggestions: [
    "Me fale sobre Pikachu",
    "Sugira um time balanceado",
    "Quais são os tipos de Pokémon?",
    "Monte um time mono-type de Fogo"
  ],

  sendMessage: async (content: string) => {
    try {
      set({ isLoading: true, error: null });

      // Adiciona mensagem do usuário localmente
      const userMessage: Message = {
        id: Date.now(),
        user_id: 0,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Envia para API
      const response = await api.post<ChatResponse>('/chat/message', { content });

      // Adiciona resposta do assistente
      const assistantMessage: Message = {
        id: Date.now() + 1,
        user_id: 0,
        role: 'assistant',
        content: response.data.message,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        suggestions: response.data.suggestions || state.suggestions,
        isLoading: false,
      }));

    } catch (error: any) {
      console.error('Error sending message:', error);
      set({
        error: error.response?.data?.detail || 'Erro ao enviar mensagem',
        isLoading: false,
      });
    }
  },

  loadHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/chat/history');
      set({
        messages: response.data.messages,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error loading history:', error);
      set({
        error: error.response?.data?.detail || 'Erro ao carregar histórico',
        isLoading: false,
      });
    }
  },

  clearHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.delete('/chat/history');
      set({
        messages: [],
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error clearing history:', error);
      set({
        error: error.response?.data?.detail || 'Erro ao limpar histórico',
        isLoading: false,
      });
    }
  },

  setError: (error) => set({ error }),
}));