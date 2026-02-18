/**
 * Zustand Store para Gerenciamento de Conversas
 * 
 * Responsável por:
 * - Carregar lista de conversas
 * - Criar, renomear e deletar conversas
 * - Gerenciar conversa ativa
 * - Persistir conversa ativa no localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { Conversation, ConversationListResponse, ConversationCreateRequest } from '../types/conversation';

interface ConversationState {
  // Estado
  conversations: Conversation[];
  activeConversationId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  setActiveConversation: (id: number) => void;
  renameConversation: (id: number, newTitle: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  clearConversations: () => void;
  updateConversationMessageCount: (conversationId: number) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,

      // Buscar todas as conversas
      fetchConversations: async () => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('📂 [STORE] Buscando conversas...');
          const response = await api.get<ConversationListResponse>('/api/conversations/');
          
          console.log(`✅ [STORE] ${response.data.total} conversas carregadas`);
          set({ 
            conversations: response.data.conversations,
            isLoading: false 
          });

          // Se não tem conversa ativa, definir a primeira
          const { activeConversationId, conversations } = get();
          if (!activeConversationId && conversations.length > 0) {
            set({ activeConversationId: conversations[0].id });
          }
        } catch (error: any) {
          console.error('❌ [STORE] Erro ao buscar conversas:', error);
          set({ 
            error: error.response?.data?.detail || 'Erro ao carregar conversas',
            isLoading: false 
          });
        }
      },

      // Criar nova conversa
      createConversation: async (title = 'Nova Conversa') => {
        set({ isLoading: true, error: null });
        
        try {
          console.log(`➕ [STORE] Criando conversa: "${title}"`);
          
          const payload: ConversationCreateRequest = { title };
          const response = await api.post<Conversation>('/api/conversations/', payload);
          
          const newConversation = response.data;
          console.log(`✅ [STORE] Conversa criada: ID ${newConversation.id}`);

          // Adicionar à lista
          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            activeConversationId: newConversation.id,
            isLoading: false,
          }));

          return newConversation;
        } catch (error: any) {
          console.error('❌ [STORE] Erro ao criar conversa:', error);
          set({ 
            error: error.response?.data?.detail || 'Erro ao criar conversa',
            isLoading: false 
          });
          return null;
        }
      },

      // Definir conversa ativa
      setActiveConversation: (id: number) => {
        console.log(`📌 [STORE] Conversa ativa: ${id}`);
        set({ activeConversationId: id });
      },

      // Renomear conversa
      renameConversation: async (id: number, newTitle: string) => {
        try {
          console.log(`✏️ [STORE] Renomeando conversa ${id}: "${newTitle}"`);
          
          await api.patch(`/api/conversations/${id}`, { title: newTitle });
          
          // Atualizar na lista
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id 
                ? { ...conv, title: newTitle, updated_at: new Date().toISOString() }
                : conv
            ),
          }));

          console.log(`✅ [STORE] Conversa ${id} renomeada`);
        } catch (error: any) {
          console.error('❌ [STORE] Erro ao renomear conversa:', error);
          set({ error: error.response?.data?.detail || 'Erro ao renomear conversa' });
        }
      },

      // Deletar conversa
      deleteConversation: async (id: number) => {
        try {
          console.log(`🗑️ [STORE] Deletando conversa ${id}`);
          
          await api.delete(`/api/conversations/${id}`);
          
          const { activeConversationId, conversations } = get();
          const remainingConversations = conversations.filter((conv) => conv.id !== id);

          // Se deletou a conversa ativa, mudar para outra
          let newActiveId = activeConversationId;
          if (activeConversationId === id) {
            newActiveId = remainingConversations.length > 0 
              ? remainingConversations[0].id 
              : null;
          }

          set({
            conversations: remainingConversations,
            activeConversationId: newActiveId,
          });

          console.log(`✅ [STORE] Conversa ${id} deletada`);
        } catch (error: any) {
          console.error('❌ [STORE] Erro ao deletar conversa:', error);
          set({ error: error.response?.data?.detail || 'Erro ao deletar conversa' });
        }
      },

      // Limpar todas as conversas (logout)
      clearConversations: () => {
        console.log('🧹 [STORE] Limpando conversas');
        set({
          conversations: [],
          activeConversationId: null,
          isLoading: false,
          error: null,
        });
      },

      // Atualizar contador de mensagens de uma conversa
      updateConversationMessageCount: (conversationId: number) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, message_count: conv.message_count + 2, updated_at: new Date().toISOString() }
              : conv
          ),
        }));
      },
    }),
    {
      name: 'conversation-storage', // nome no localStorage
      partialize: (state) => ({
        activeConversationId: state.activeConversationId, // persistir apenas conversa ativa
      }),
    }
  )
);