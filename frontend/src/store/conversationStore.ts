/**
 * Zustand Store para Gerenciamento de Conversas
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { Conversation, ConversationListResponse, ConversationCreateRequest } from '../types/conversation';

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: number | null;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  setActiveConversation: (id: number) => void;
  renameConversation: (id: number, newTitle: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
  clearConversations: () => void;
  updateConversationMessageCount: (conversationId: number) => void;
  // ← novo: atualiza título localmente sem chamar API
  updateConversationTitle: (conversationId: number, newTitle: string) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,

      fetchConversations: async () => {
        set({ isLoading: true, error: null });

        try {
          console.log('📂 [STORE] Buscando conversas...');
          const response = await api.get<ConversationListResponse>('/api/conversations/');

          console.log(`✅ [STORE] ${response.data.total} conversas carregadas`);

          let conversations = response.data.conversations;
          let activeId = get().activeConversationId;

          // Se não tem nenhuma conversa, criar uma padrão
          if (conversations.length === 0) {
            console.log('📝 [STORE] Nenhuma conversa encontrada, criando conversa padrão...');
            const newConv = await get().createConversation('Nova Conversa');
            if (newConv) {
              conversations = [newConv];
              activeId = newConv.id;
            }
          }

          // Garantir que a conversa ativa ainda existe
          const activeStillExists = conversations.some(c => c.id === activeId);

          set({
            conversations,
            activeConversationId: activeStillExists
              ? activeId
              : (conversations.length > 0 ? conversations[0].id : null),
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('❌ [STORE] Erro ao buscar conversas:', error);
          set({ isLoading: false, error: 'Erro ao carregar conversas' });
        }
      },

      createConversation: async (title = 'Nova Conversa') => {
        try {
          const response = await api.post('/api/conversations/', { title });
          const newConv: Conversation = response.data;

          set((state) => ({
            conversations: [newConv, ...state.conversations],
            activeConversationId: newConv.id,
          }));

          console.log(`✅ [STORE] Conversa criada: "${newConv.title}" (ID: ${newConv.id})`);
          return newConv;
        } catch (error) {
          console.error('❌ [STORE] Erro ao criar conversa:', error);
          return null;
        }
      },

      setActiveConversation: (id: number) => {
        set({ activeConversationId: id });
      },

      renameConversation: async (id: number, newTitle: string) => {
        try {
          await api.patch(`/api/conversations/${id}`, { title: newTitle });

          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === id ? { ...c, title: newTitle } : c
            ),
          }));

          console.log(`✅ [STORE] Conversa ${id} renomeada para "${newTitle}"`);
        } catch (error) {
          console.error('❌ [STORE] Erro ao renomear conversa:', error);
        }
      },

      deleteConversation: async (id: number) => {
        try {
          await api.delete(`/api/conversations/${id}`);

          const remaining = get().conversations.filter((c) => c.id !== id);
          const activeId = get().activeConversationId;

          set({
            conversations: remaining,
            activeConversationId:
              activeId === id
                ? (remaining.length > 0 ? remaining[0].id : null)
                : activeId,
          });

          console.log(`✅ [STORE] Conversa ${id} deletada`);
        } catch (error) {
          console.error('❌ [STORE] Erro ao deletar conversa:', error);
        }
      },

      clearConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },

      updateConversationMessageCount: (conversationId: number) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, message_count: (c.message_count || 0) + 2 } // +1 user +1 bot
              : c
          ),
        }));
      },

      // Atualiza título localmente — chamado após backend gerar título automático
      updateConversationTitle: (conversationId: number, newTitle: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, title: newTitle } : c
          ),
        }));
        console.log(`✏️ [STORE] Título atualizado localmente: "${newTitle}"`);
      },
    }),
    {
      name: 'conversation-storage',
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);