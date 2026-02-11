from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class MessageBase(BaseModel):
    """Schema base de mensagem."""
    content: str = Field(..., min_length=1, max_length=2000)


class MessageCreate(MessageBase):
    """Schema para criar mensagem."""
    pokemon_context: Optional[str] = None


class Message(MessageBase):
    """Schema de mensagem completo."""
    id: int
    user_id: int
    role: str  # 'user' ou 'assistant'
    pokemon_context: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """Schema de resposta do chat."""
    message: str
    pokemon_data: Optional[dict] = None
    suggestions: Optional[List[str]] = None


class ConversationHistory(BaseModel):
    """Schema do histórico de conversa."""
    messages: List[Message]
    total: int


class ClearHistoryResponse(BaseModel):
    """Schema de resposta ao limpar histórico."""
    message: str
    deleted_count: int