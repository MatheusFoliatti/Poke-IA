from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_service

router = APIRouter()


@router.post("/message", response_model=None)
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
        
        # DEBUG: Ver o que está sendo retornado
        print(f"🔍 [CHAT] Tipo de result: {type(result)}")
        print(f"🔍 [CHAT] Chaves em result: {result.keys()}")
        
        pokemon_data = result.get("pokemon_data")
        print(f"🔍 [CHAT] pokemon_data tipo: {type(pokemon_data)}")
        
        if pokemon_data:
            print(f"🔍 [CHAT] pokemon_data conteúdo:")
            print(f"   - id: {pokemon_data.get('id')}")
            print(f"   - name: {pokemon_data.get('name')}")
            print(f"   - types: {pokemon_data.get('types')}")
            print(f"   - stats: {pokemon_data.get('stats')}")
            print(f"   - stats tipo: {type(pokemon_data.get('stats'))}")
            
            # Tentar serializar para JSON para ver se há problemas
            try:
                json_test = json.dumps(pokemon_data)
                print(f"✅ [CHAT] pokemon_data serializa OK para JSON")
            except Exception as je:
                print(f"❌ [CHAT] ERRO ao serializar pokemon_data: {je}")
        
        # Retornar diretamente o dicionário sem validação Pydantic
        response = {
            "user_message": result["user_message"],
            "bot_response": result["bot_response"],
            "pokemon_data": pokemon_data,
            "timestamp": result["timestamp"]
        }
        
        print(f"📤 [CHAT] Enviando resposta para frontend")
        return response
        
    except Exception as e:
        print(f"❌ [CHAT] Erro ao processar mensagem: {e}")
        import traceback
        traceback.print_exc()
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