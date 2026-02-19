import React, { useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore';

export const TestConversations: React.FC = () => {
  const { 
    conversations, 
    activeConversationId,
    isLoading,
    fetchConversations,
    createConversation,
  } = useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>Test Conversations Store</h2>
      <button onClick={() => createConversation('Test Conversa')}>
        Criar Conversa
      </button>
      <p>Loading: {isLoading ? 'Sim' : 'Não'}</p>
      <p>Active ID: {activeConversationId}</p>
      <p>Total: {conversations.length}</p>
      <ul>
        {conversations.map(c => (
          <li key={c.id}>{c.title} ({c.message_count} msgs)</li>
        ))}
      </ul>
    </div>
  );
};