"""
Endpoints de Chat
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.db.database import get_db
from app.db.models import User, ChatMessage, Conversation
from app.core.security import get_current_user
from app.services.chat_service import chat_service
from app.services.conversation_service import conversation_service
from pydantic import BaseModel
import re

router = APIRouter()


class MessageRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class MessageResponse(BaseModel):
    user_message: dict
    bot_response: dict
    conversation_id: int
    conversation_title: Optional[str] = None  # ← retorna título se foi gerado


# Títulos padrão que devem ser substituídos automaticamente
DEFAULT_TITLES = {
    "nova conversa",
    "conversa principal",
    "new conversation",
}


def generate_title(message: str, pokemon_data: Optional[dict]) -> str:
    """
    Gera título automático baseado no conteúdo da mensagem.

    Prioridade:
    1. Comparação detectada  → "Charizard vs Blastoise"
    2. Equipe detectada      → "Equipe Fire Ofensiva"
    3. Pokémon único         → "Sobre Charizard"
    4. Fallback              → primeiros 35 caracteres da mensagem
    """

    if pokemon_data:
        # Comparação
        if pokemon_data.get("is_comparison"):
            pokemon_list = pokemon_data.get("pokemon_list", [])
            if len(pokemon_list) >= 2:
                p1 = pokemon_list[0]["name"].capitalize()
                p2 = pokemon_list[1]["name"].capitalize()
                return f"{p1} vs {p2}"

        # Equipe
        if pokemon_data.get("is_team"):
            msg_lower = message.lower()
            type_map = {
                "fire": "Fire",
                "water": "Água",
                "grass": "Grama",
                "electric": "Elétrico",
                "psychic": "Psíquico",
                "dragon": "Dragão",
                "ghost": "Fantasma",
                "ice": "Gelo",
                "fighting": "Lutador",
                "dark": "Sombrio",
                "steel": "Metálico",
                "fairy": "Fada",
                "rock": "Pedra",
                "ground": "Terra",
                "flying": "Voador",
                "fogo": "Fire",
                "água": "Água",
                "grama": "Grama",
                "elétrico": "Elétrico",
                "dragão": "Dragão",
            }
            strategy_map = {
                "ofensiv": "Ofensiva",
                "offensive": "Ofensiva",
                "defensiv": "Defensiva",
                "tank": "Defensiva",
                "velocidade": "Velocidade",
                "speed": "Velocidade",
            }

            detected_type = next(
                (pt for key, pt in type_map.items() if key in msg_lower), None
            )
            detected_strategy = next(
                (ps for key, ps in strategy_map.items() if key in msg_lower), None
            )

            title = "Equipe"
            if detected_type:
                title += f" {detected_type}"
            if detected_strategy:
                title += f" {detected_strategy}"
            return title

        # Pokémon único
        name = pokemon_data.get("name")
        if name:
            return f"Sobre {name.capitalize()}"

    # Fallback: primeiros 35 caracteres limpos
    clean = re.sub(r"\s+", " ", message.strip())
    return clean[:35] + ("..." if len(clean) > 35 else "")


@router.post("/message", response_model=MessageResponse)
async def send_message(
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    print(f"💬 [CHAT] Mensagem de {current_user.username}: {request.message[:50]}...")

    # Obter ou criar conversa
    if request.conversation_id:
        conversation = conversation_service.get_conversation_by_id(
            db, request.conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
            )
    else:
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        print(f"📝 [CHAT] Usando conversa padrão ID: {conversation.id}")

    # Verificar se é a primeira mensagem da conversa (para gerar título)
    existing_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .count()
    )
    is_first_message = existing_messages == 0

    # Detectar Pokémon e construir contexto
    pokemon_data = await chat_service._detect_and_fetch_pokemon(request.message)
    history = chat_service._get_chat_history(current_user.id, db)
    context = chat_service._build_context(history, pokemon_data)

    # Gerar resposta do LLM
    try:
        bot_response_text = await chat_service.llama.generate_response(
            user_message=request.message, context=context
        )
    except Exception as e:
        print(f"❌ [CHAT] Erro ao gerar resposta do LLM: {e}")
        if pokemon_data:
            name = pokemon_data.get("name", "este Pokémon").title()
            bot_response_text = f"Aqui estão as informações sobre {name}! Veja os detalhes no card ao lado."
        else:
            bot_response_text = (
                "Desculpe, estou com dificuldades técnicas. Tente novamente!"
            )

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
        pokemon_data=pokemon_data,
    )
    db.add(bot_message)

    # Gerar título automático se for a primeira mensagem e o título for padrão
    new_title = None
    if is_first_message and conversation.title.lower().strip() in DEFAULT_TITLES:
        new_title = generate_title(request.message, pokemon_data)
        conversation.title = new_title
        print(f"✏️ [CHAT] Título gerado automaticamente: '{new_title}'")

    conversation.updated_at = datetime.utcnow()
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
        conversation_title=new_title,  # None se não foi atualizado
    )


@router.get("/history")
async def get_history(
    conversation_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not conversation_id:
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        conversation_id = conversation.id
    else:
        conversation = conversation_service.get_conversation_by_id(
            db, conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
            )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    print(
        f"📜 [CHAT] Carregadas {len(messages)} mensagens da conversa {conversation_id}"
    )

    return {
        "conversation_id": conversation_id,
        "messages": [
            {
                "id": msg.id,
                "content": msg.content,
                "is_bot": msg.is_bot,
                "timestamp": msg.created_at.isoformat() + "Z",
                "pokemon_data": msg.pokemon_data,
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
    if not conversation_id:
        conversation = conversation_service.get_or_create_default_conversation(
            db, current_user.id
        )
        conversation_id = conversation.id
    else:
        conversation = conversation_service.get_conversation_by_id(
            db, conversation_id, current_user.id
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversa não encontrada"
            )

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
    """Retorna lista de Pokémon com sprites para o autocomplete"""
    from app.services.chat_service import POKEMON_NAMES_CACHE, load_pokemon_names_cache

    if not POKEMON_NAMES_CACHE:
        await load_pokemon_names_cache()

    pokemon_with_sprites = []
    for idx, name in enumerate(POKEMON_NAMES_CACHE, start=1):
        pokemon_id = idx if idx <= 1025 else 10000 + (idx - 1025)
        pokemon_with_sprites.append(
            {
                "name": name,
                "sprite": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png",
            }
        )

    mega_count = sum(1 for p in pokemon_with_sprites if "-mega" in p["name"])
    print(
        f"✅ [API] Retornando {len(pokemon_with_sprites)} Pokémon ({mega_count} Megas)"
    )

    return {"pokemon": pokemon_with_sprites, "count": len(pokemon_with_sprites)}
