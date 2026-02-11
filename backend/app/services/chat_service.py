from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.llm import llama_chat
from app.db.models import ChatMessage, User
from app.services.pokeapi import pokeapi_service
import re


class ChatService:
    def __init__(self):
        self.llama = llama_chat
        
    async def process_message(
        self, 
        message: str, 
        user_id: int, 
        db: Session
    ) -> dict:
        """Processa uma mensagem do usuário e retorna a resposta da IA"""
        
        # Salvar mensagem do usuário
        user_message = ChatMessage(
            user_id=user_id,
            content=message,
            is_bot=False,
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        db.commit()
        
        # Buscar histórico de conversas
        history = self._get_chat_history(user_id, db)
        
        # Detectar se menciona um Pokémon específico
        pokemon_data = await self._detect_and_fetch_pokemon(message)
        
        # Gerar contexto para a LLM
        context = self._build_context(history, pokemon_data)
        
        # Gerar resposta da IA
        bot_response = await self.llama.generate_response(
            user_message=message,
            context=context
        )
        
        # Salvar resposta do bot
        bot_message = ChatMessage(
            user_id=user_id,
            content=bot_response,
            is_bot=True,
            created_at=datetime.utcnow()
        )
        db.add(bot_message)
        db.commit()
        
        return {
            "user_message": message,
            "bot_response": bot_response,
            "pokemon_data": pokemon_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _get_chat_history(self, user_id: int, db: Session, limit: int = 10) -> List[dict]:
        """Busca histórico recente de mensagens"""
        messages = db.query(ChatMessage)\
            .filter(ChatMessage.user_id == user_id)\
            .order_by(ChatMessage.created_at.desc())\
            .limit(limit)\
            .all()
        
        return [
            {
                "role": "assistant" if msg.is_bot else "user",
                "content": msg.content
            }
            for msg in reversed(messages)
        ]
    
    async def _detect_and_fetch_pokemon(self, message: str) -> Optional[dict]:
        """Detecta menção a Pokémon e busca dados da PokéAPI"""
        # Padrões simples de detecção
        patterns = [
            r"sobre (?:o )?(\w+)",
            r"(?:pokemon|pokémon) (\w+)",
            r"^(\w+)$"  # Apenas um nome
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message.lower())
            if match:
                pokemon_name = match.group(1)
                try:
                    return await pokeapi_service.get_pokemon(pokemon_name)
                except:
                    continue
        
        return None
    
    def _build_context(self, history: List[dict], pokemon_data: Optional[dict]) -> str:
        """Constrói contexto para a LLM"""
        context_parts = []
        
        # Adicionar histórico
        if history:
            context_parts.append("Histórico da conversa:")
            for msg in history[-5:]:  # Últimas 5 mensagens
                role = "Usuário" if msg["role"] == "user" else "Assistente"
                context_parts.append(f"{role}: {msg['content']}")
        
        # Adicionar dados do Pokémon se disponível
        if pokemon_data:
            context_parts.append(f"\nDados do Pokémon {pokemon_data['name']}:")
            context_parts.append(f"- Tipos: {', '.join(pokemon_data['types'])}")
            context_parts.append(f"- HP: {pokemon_data['stats']['hp']}")
            context_parts.append(f"- Ataque: {pokemon_data['stats']['attack']}")
            context_parts.append(f"- Defesa: {pokemon_data['stats']['defense']}")
            context_parts.append(f"- Habilidades: {', '.join(pokemon_data['abilities'])}")
        
        return "\n".join(context_parts)
    
    async def get_chat_history_for_user(self, user_id: int, db: Session) -> List[dict]:
        """Retorna todo o histórico de chat do usuário"""
        messages = db.query(ChatMessage)\
            .filter(ChatMessage.user_id == user_id)\
            .order_by(ChatMessage.created_at.asc())\
            .all()
        
        return [
            {
                "id": msg.id,
                "content": msg.content,
                "is_bot": msg.is_bot,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    
    async def clear_chat_history(self, user_id: int, db: Session) -> bool:
        """Limpa o histórico de chat do usuário"""
        try:
            db.query(ChatMessage)\
                .filter(ChatMessage.user_id == user_id)\
                .delete()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False


# Instância global do serviço (IMPORTANTE!)
chat_service = ChatService()