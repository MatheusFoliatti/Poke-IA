from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envia uma mensagem para o chat e recebe resposta da IA.
    """
    print(f"💬 [CHAT] Usuário {current_user.username} enviou: {chat_request.message}")
    
    try:
        result = await chat_service.process_message(
            message=chat_request.message,
            user_id=current_user.id,
            db=db
        )
        
        print(f"✅ [CHAT] Resposta gerada com sucesso")
        
        return ChatResponse(
            user_message=result["user_message"],
            bot_response=result["bot_response"],
            pokemon_data=result.get("pokemon_data"),
            timestamp=result["timestamp"]
        )
    except Exception as e:
        print(f"❌ [CHAT] Erro ao processar mensagem: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna histórico de chat do usuário.
    """
    print(f"📜 [CHAT] Buscando histórico de {current_user.username}")
    
    history = await chat_service.get_chat_history_for_user(
        user_id=current_user.id,
        db=db
    )
    
    return history


@router.delete("/clear")
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Limpa o histórico de chat do usuário.
    """
    print(f"🗑️ [CHAT] Limpando histórico de {current_user.username}")
    
    success = await chat_service.clear_chat_history(
        user_id=current_user.id,
        db=db
    )
    
    if success:
        return {"message": "Histórico limpo com sucesso"}
    else:
        raise HTTPException(status_code=500, detail="Erro ao limpar histórico")