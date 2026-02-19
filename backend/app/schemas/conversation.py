"""
Schemas Pydantic para Conversas

Define estruturas de dados para request/response da API de conversas.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ConversationBase(BaseModel):
    """Schema base para Conversation"""
    title: str = Field(..., min_length=1, max_length=255, description="Título da conversa")


class ConversationCreate(ConversationBase):
    """Schema para criar nova conversa"""
    pass


class ConversationUpdate(BaseModel):
    """Schema para atualizar conversa (apenas título)"""
    title: str = Field(..., min_length=1, max_length=255, description="Novo título da conversa")


class ConversationResponse(ConversationBase):
    """Schema de resposta com dados completos da conversa"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True  # Permite criar a partir de modelos SQLAlchemy


class ConversationListResponse(BaseModel):
    """Schema de resposta para lista de conversas"""
    conversations: list[ConversationResponse]
    total: int