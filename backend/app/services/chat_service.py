# backend/app/services/chat_service.py
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.db.models import Conversation
from app.core.llm import llama_service
from app.services.pokeapi import pokeapi_service
import re


class ChatService:
    """Serviço para gerenciar conversas e interações com o chatbot."""
    
    def __init__(self):
        self.llama = llama_service
        self.pokeapi = pokeapi_service
    
    async def process_message(
        self,
        user_id: int,
        message: str,
        db: Session
    ) -> Dict:
        """Processa mensagem do usuário e gera resposta."""
        pokemon_context = self._extract_pokemon_name(message)
        pokemon_data = None
        
        if pokemon_context:
            pokemon_data = await self.pokeapi.get_detailed_pokemon_info(pokemon_context.lower())
        
        user_message = Conversation(
            user_id=user_id,
            role="user",
            content=message,
            pokemon_context=pokemon_context
        )
        db.add(user_message)
        db.commit()
        
        history = self.get_history(user_id, db, limit=10)
        
        conversation_context = []
        for msg in history:
            conversation_context.append({
                "role": msg.role,
                "content": msg.content
            })
        
        assistant_response = self.llama.generate_pokemon_response(
            user_message=message,
            conversation_history=conversation_context,
            pokemon_data=self._format_pokemon_data(pokemon_data) if pokemon_data else None
        )
        
        assistant_message = Conversation(
            user_id=user_id,
            role="assistant",
            content=assistant_response,
            pokemon_context=pokemon_context
        )
        db.add(assistant_message)
        db.commit()
        
        suggestions = self._generate_suggestions(message, pokemon_context)
        
        return {
            "message": assistant_response,
            "pokemon_data": self._simplify_pokemon_data(pokemon_data) if pokemon_data else None,
            "suggestions": suggestions
        }
    
    def _extract_pokemon_name(self, message: str) -> Optional[str]:
        """Extrai nome de Pokémon da mensagem."""
        common_words = {
            'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
            'é', 'são', 'quem', 'qual', 'onde', 'quando', 'como', 'porque',
            'pokemon', 'pokémon', 'que', 'me', 'fale', 'sobre', 'mostre'
        }
        
        words = message.split()
        for word in words:
            clean_word = re.sub(r'[^\w]', '', word)
            if clean_word and clean_word.lower() not in common_words:
                if clean_word[0].isupper() or len(clean_word) > 3:
                    return clean_word.capitalize()
        
        return None
    
    def get_history(self, user_id: int, db: Session, limit: int = 10) -> List[Conversation]:
        """Obtém histórico de conversa do usuário."""
        return db.query(Conversation)\
            .filter(Conversation.user_id == user_id)\
            .order_by(Conversation.created_at.desc())\
            .limit(limit)\
            .all()[::-1]
    
    def _format_pokemon_data(self, pokemon: Dict) -> str:
        """Formata dados do Pokémon para o contexto do LLM."""
        types = [t['type']['name'] for t in pokemon.get('types', [])]
        stats = {s['stat']['name']: s['base_stat'] for s in pokemon.get('stats', [])}
        
        formatted = f"""
Nome: {pokemon['name'].capitalize()}
ID: #{pokemon['id']}
Tipos: {', '.join(types)}
Stats: HP:{stats.get('hp', 0)} ATK:{stats.get('attack', 0)} DEF:{stats.get('defense', 0)}
"""
        return formatted
    
    def _simplify_pokemon_data(self, pokemon: Dict) -> Dict:
        """Simplifica dados do Pokémon para resposta da API."""
        return {
            "id": pokemon['id'],
            "name": pokemon['name'],
            "types": [t['type']['name'] for t in pokemon.get('types', [])],
            "sprite": pokemon.get('sprites', {}).get('other', {}).get('official-artwork', {}).get('front_default'),
            "stats": {
                s['stat']['name']: s['base_stat'] 
                for s in pokemon.get('stats', [])
            }
        }
    
    def _generate_suggestions(self, message: str, pokemon_context: Optional[str]) -> List[str]:
        """Gera sugestões de perguntas baseadas no contexto."""
        if pokemon_context:
            return [
                f"Qual a melhor moveset para {pokemon_context}?",
                f"Quais são os counters de {pokemon_context}?",
                f"Como {pokemon_context} evolui?"
            ]
        else:
            return [
                "Me fale sobre Pikachu",
                "Sugira um time balanceado",
                "Quais são os tipos de Pokémon?"
            ]
    
    def clear_history(self, user_id: int, db: Session) -> int:
        """Limpa histórico de conversa do usuário."""
        deleted = db.query(Conversation)\
            .filter(Conversation.user_id == user_id)\
            .delete()
        db.commit()
        return deleted


chat_service = ChatService()