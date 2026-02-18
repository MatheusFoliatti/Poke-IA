"""
Endpoints de Chat

API para enviar mensagens e obter histórico de conversas.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import User, ChatMessage
from app.core.security import get_current_user
from app.services.chat_service import chat_service
from app.services.conversation_service import conversation_service
from pydantic import BaseModel

router = APIRouter()


class MessageRequest(BaseModel):
    """Schema para enviar mensagem"""
    message: str
    conversation_id: Optional[int] = None


class MessageResponse(BaseModel):
    """Schema de resposta de mensagem"""
    user_message: dict
    bot_response: dict
    conversation_id: int


@router.post("/message", response_model=MessageResponse)
async def send_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Envia mensagem e recebe resposta do bot
    
    Args:
        request: Mensagem e conversation_id opcional
        
    Returns:
        Mensagem do usuário, resposta do bot e ID da conversa
    """
    print(f"💬 [CHAT] Mensagem de {current_user.username}: {request.message[:50]}...")
    
    # Obter ou criar conversa padrão se não fornecida
    if request.conversation_id:
        # Verificar se conversa existe e pertence ao usuário
        conversation = conversation_service.get_conversation_by_id(
            db, request.conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada"
            )
    else:
        # Criar ou obter conversa padrão
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        print(f"📝 [CHAT] Usando conversa padrão ID: {conversation.id}")
    
    # Processar mensagem usando o serviço (que já salva user_message e bot_message)
    # NOTA: O chat_service.process_message já salva as mensagens, então vamos adaptar
    
    # Deletar mensagens que o chat_service vai criar (ele não sabe de conversation_id ainda)
    # Vamos processar direto aqui
    
    # Detectar e buscar Pokémon
    pokemon_data = await chat_service._detect_and_fetch_pokemon(request.message)
    
    # Construir contexto
    history = chat_service._get_chat_history(current_user.id, db)
    context = chat_service._build_context(history, pokemon_data)
    
    # Gerar resposta
    try:
        bot_response_text = await chat_service.llama.generate_response(
            user_message=request.message, context=context
        )
    except Exception as e:
        print(f"❌ [CHAT] Erro ao gerar resposta: {e}")
        bot_response_text = chat_service._generate_fallback_response(pokemon_data)
    
    # Salvar mensagem do usuário
    user_message = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        content=request.message,
        is_bot=False,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Salvar resposta do bot
    bot_message = ChatMessage(
        conversation_id=conversation.id,
        user_id=current_user.id,
        content=bot_response_text,
        is_bot=True,
    )
    db.add(bot_message)
    db.commit()
    db.refresh(bot_message)
    
    print(f"✅ [CHAT] Mensagens salvas na conversa {conversation.id}")
    
    return MessageResponse(
        user_message={
            "id": user_message.id,
            "content": user_message.content,
            "timestamp": user_message.created_at.isoformat() + "Z",
        },
        bot_response={
            "id": bot_message.id,
            "content": bot_message.content,
            "timestamp": bot_message.created_at.isoformat() + "Z",
            "pokemon_data": pokemon_data,
        },
        conversation_id=conversation.id,
    )


@router.get("/history")
async def get_history(
    conversation_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Obtém histórico de mensagens
    
    Args:
        conversation_id: ID da conversa (opcional - retorna conversa padrão)
        
    Returns:
        Lista de mensagens da conversa
    """
    # Se não forneceu conversation_id, buscar conversa padrão
    if not conversation_id:
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        conversation_id = conversation.id
    else:
        # Verificar se conversa pertence ao usuário
        conversation = conversation_service.get_conversation_by_id(
            db, conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada"
            )
    
    # Buscar mensagens da conversa
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    
    print(f"📜 [CHAT] Carregadas {len(messages)} mensagens da conversa {conversation_id}")
    
    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "id": msg.id,
                "content": msg.content,
                "is_bot": msg.is_bot,
                "timestamp": msg.created_at.isoformat() + "Z",
            }
            for msg in messages
        ],
    }


@router.delete("/history")
async def clear_history(
    conversation_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Limpa histórico de mensagens de uma conversa
    
    Args:
        conversation_id: ID da conversa (opcional - limpa conversa padrão)
        
    Returns:
        Mensagem de confirmação
    """
    # Se não forneceu conversation_id, buscar conversa padrão
    if not conversation_id:
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        conversation_id = conversation.id
    else:
        # Verificar se conversa pertence ao usuário
        conversation = conversation_service.get_conversation_by_id(
            db, conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversa não encontrada"
            )
    
    # Deletar todas as mensagens da conversa
    deleted_count = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .delete()
    )
    db.commit()
    
    print(f"🗑️ [CHAT] {deleted_count} mensagens deletadas da conversa {conversation_id}")
    
    return {
        "message": "Histórico limpo com sucesso",
        "deleted_count": deleted_count,
        "conversation_id": conversation_id,
    }


@router.get("/pokemon-list")
async def get_pokemon_list():
    """
    Retorna lista de Pokémon para autocomplete
    
    Returns:
        Lista de Pokémon com nomes e sprites
    """
    from app.services.pokeapi import get_all_pokemon_names
    
    pokemon_list = await get_all_pokemon_names()
    
    return {
        "pokemon": pokemon_list,
        "count": len(pokemon_list),
    }