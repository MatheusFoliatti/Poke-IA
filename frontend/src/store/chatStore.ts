/**
 * Zustand Store para Chat
 */

import { create } from 'zustand';
import api from '../services/api';
import { useConversationStore } from './conversationStore';

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

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (message: string, conversationId?: number) => {
    try {
      console.log(`💬 [CHAT] Enviando: "${message}"`);

      // ✅ Adiciona mensagem do usuário IMEDIATAMENTE na tela
      const tempId = Date.now();
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: tempId,
            content: message,
            is_bot: false,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      const payload: any = { message };
      if (conversationId) payload.conversation_id = conversationId;

      // Aguarda resposta da API
      const response = await api.post('/api/chat/message', payload);
      const { user_message, bot_response, conversation_title } = response.data;

      // Substitui mensagem temporária pela real + adiciona bot
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== tempId),
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

      // Atualiza título na sidebar se gerado automaticamente
      if (conversation_title) {
        const convId = conversationId ?? response.data.conversation_id;
        if (convId) {
          useConversationStore.getState().updateConversationTitle(convId, conversation_title);
          console.log(`✏️ [CHAT] Título atualizado: "${conversation_title}"`);
        }
      }

      console.log('✅ [CHAT] Mensagem enviada');
    } catch (error: any) {
      // Remove mensagem temporária em caso de erro
      const tempId = get().messages[get().messages.length - 1]?.id;
      if (tempId) {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== tempId),
        }));
      }
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

      set({ messages: response.data.messages, isLoading: false });
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
      await api.delete(url);
      set({ messages: [] });
      console.log('✅ [CHAT] Histórico limpo');
    } catch (error: any) {
      console.error('❌ [CHAT] Erro ao limpar histórico:', error);
    }
  },

  clearMessages: () => set({ messages: [] }),
}));