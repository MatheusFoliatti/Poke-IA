/**
 * Types para sistema de conversas
 */

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationCreateRequest {
  title: string;
}

export interface ConversationUpdateRequest {
  title: string;
}