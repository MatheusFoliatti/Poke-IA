"""
Endpoints de Conversas

API RESTful para gerenciar conversas dos usuários.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, ChatMessage
from app.core.security import get_current_user
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
)
from app.services.conversation_service import conversation_service

router = APIRouter()


@router.get("/", response_model=ConversationListResponse)
async def list_conversations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    Lista todas as conversas do usuário autenticado

    Returns:
        Lista de conversas com contagem de mensagens
    """
    conversations = conversation_service.get_user_conversations(db, current_user.id)

    return ConversationListResponse(
        conversations=conversations, total=len(conversations)
    )


@router.post(
    "/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED
)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cria nova conversa

    Args:
        conversation: Dados da conversa (título)

    Returns:
        Conversa criada
    """
    new_conversation = conversation_service.create_conversation(
        db, current_user.id, conversation
    )
    # ← REMOVIDO: new_conversation.message_count = 0
    # message_count é calculado automaticamente pela property

    return new_conversation


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    update_data: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Atualiza título da conversa

    Args:
        conversation_id: ID da conversa
        update_data: Novos dados (título)

    Returns:
        Conversa atualizada

    Raises:
        404: Conversa não encontrada ou não pertence ao usuário
    """
    conversation = conversation_service.update_conversation(
        db, conversation_id, current_user.id, update_data
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
        )

    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deleta conversa e todas as mensagens associadas

    Args:
        conversation_id: ID da conversa

    Raises:
        404: Conversa não encontrada ou não pertence ao usuário
    """
    success = conversation_service.delete_conversation(
        db, conversation_id, current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
        )

    return None


@router.get("/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtém todas as mensagens de uma conversa

    Args:
        conversation_id: ID da conversa

    Returns:
        Lista de mensagens

    Raises:
        404: Conversa não encontrada
    """
    # Verificar se conversa existe e pertence ao usuário
    conversation = conversation_service.get_conversation_by_id(
        db, conversation_id, current_user.id
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
        )

    # Buscar mensagens
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "id": msg.id,
                "content": msg.content,
                "is_bot": msg.is_bot,
                "pokemon_data": msg.pokemon_data,  # ← ADICIONAR pokemon_data
                "created_at": msg.created_at.isoformat() + "Z",
            }
            for msg in messages
        ],
        "total": len(messages),
    }
