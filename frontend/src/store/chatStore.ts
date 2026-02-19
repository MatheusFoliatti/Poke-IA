/**
 * Zustand Store para Chat
 * 
 * Gerencia mensagens e interação com API de chat
 */

import { create } from 'zustand';
import api from '../services/api';

interface Message {
  id: number;
  content: string;
  is_bot: boolean;
  timestamp: string;
  pokemon_data?: any;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  
  sendMessage: (message: string, conversationId?: number) => Promise<void>;
  loadHistory: (conversationId?: number) => Promise<void>;
  clearHistory: (conversationId?: number) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (message: string, conversationId?: number) => {
    try {
      console.log(`💬 [CHAT] Enviando: "${message}" (conversa: ${conversationId || 'padrão'})`);
      
      const payload: any = { message };
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await api.post('/api/chat/message', payload);
      
      // Adicionar mensagens ao estado
      const { user_message, bot_response } = response.data;
      
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: user_message.id,
            content: user_message.content,
            is_bot: false,
            timestamp: user_message.timestamp,
          },
          {
            id: bot_response.id,
            content: bot_response.content,
            is_bot: true,
            timestamp: bot_response.timestamp,
            pokemon_data: bot_response.pokemon_data,
          },
        ],
      }));

      console.log('✅ [CHAT] Mensagem enviada');
    } catch (error: any) {
      console.error('❌ [CHAT] Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  loadHistory: async (conversationId?: number) => {
    set({ isLoading: true });
    
    try {
      const url = conversationId 
        ? `/api/chat/history?conversation_id=${conversationId}`
        : '/api/chat/history';
      
      console.log(`📜 [CHAT] Carregando histórico (conversa: ${conversationId || 'padrão'})`);
      
      const response = await api.get(url);
      
      set({ 
        messages: response.data.messages,
        isLoading: false 
      });

      console.log(`✅ [CHAT] ${response.data.messages.length} mensagens carregadas`);
    } catch (error: any) {
      console.error('❌ [CHAT] Erro ao carregar histórico:', error);
      set({ isLoading: false });
    }
  },

  clearHistory: async (conversationId?: number) => {
    try {
      const url = conversationId
        ? `/api/chat/history?conversation_id=${conversationId}`
        : '/api/chat/history';

      console.log(`🗑️ [CHAT] Limpando histórico (conversa: ${conversationId || 'padrão'})`);
      
      await api.delete(url);
      
      set({ messages: [] });
      
      console.log('✅ [CHAT] Histórico limpo');
    } catch (error: any) {
      console.error('❌ [CHAT] Erro ao limpar histórico:', error);
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));