from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import User
from app.schemas.chat import (
    MessageCreate,
    ChatResponse,
    Message,
    ConversationHistory,
    ClearHistoryResponse
)
from app.api.deps import get_current_user
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envia mensagem para o chatbot e recebe resposta.
    
    Args:
        message_data: Dados da mensagem
        current_user: Usuário autenticado
        db: Sessão do banco de dados
    
    Returns:
        Resposta do chatbot com dados adicionais
    """
    try:
        response = await chat_service.process_message(
            user_id=current_user.id,
            message=message_data.content,
            db=db
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {str(e)}"
        )


@router.get("/history", response_model=ConversationHistory)
def get_conversation_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém histórico de conversas do usuário.
    
    Args:
        limit: Número máximo de mensagens a retornar
        current_user: Usuário autenticado
        db: Sessão do banco de dados
    
    Returns:
        Histórico de conversas
    """
    messages = chat_service.get_history(current_user.id, db, limit)
    
    return {
        "messages": messages,
        "total": len(messages)
    }


@router.delete("/history", response_model=ClearHistoryResponse)
def clear_conversation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Limpa todo o histórico de conversas do usuário.
    
    Args:
        current_user: Usuário autenticado
        db: Sessão do banco de dados
    
    Returns:
        Confirmação da limpeza
    """
    deleted_count = chat_service.clear_history(current_user.id, db)
    
    return {
        "message": "Histórico limpo com sucesso",
        "deleted_count": deleted_count
    }