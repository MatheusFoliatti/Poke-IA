import ollama
from typing import List, Dict, Optional
from app.core.config import settings


class LlamaChat:
    """Classe para interagir com o modelo Llama via Ollama"""
    
    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.base_url = settings.OLLAMA_BASE_URL
        self.system_prompt = """Você é um assistente especializado em Pokémon chamado PokédexAI.
Você ajuda treinadores com:
- Informações detalhadas sobre Pokémon
- Sugestões de times competitivos
- Estratégias de batalha
- Counters e matchups
- Informações sobre tipos, habilidades e movimentos

Seja amigável, use emojis quando apropriado e forneça informações precisas e úteis.
Quando não souber algo, admita e sugira onde o usuário pode encontrar a informação."""
    
    async def generate_response(
        self, 
        user_message: str, 
        context: Optional[str] = None
    ) -> str:
        """Gera uma resposta usando o modelo Llama"""
        
        try:
            # Construir o prompt completo
            full_prompt = self.system_prompt
            
            if context:
                full_prompt += f"\n\nContexto:\n{context}"
            
            full_prompt += f"\n\nUsuário: {user_message}\nAssistente:"
            
            # Chamar o Ollama
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        'role': 'system',
                        'content': self.system_prompt
                    },
                    {
                        'role': 'user',
                        'content': user_message if not context else f"{context}\n\n{user_message}"
                    }
                ]
            )
            
            return response['message']['content']
            
        except Exception as e:
            print(f"Erro ao gerar resposta: {e}")
            return "Desculpe, não consegui processar sua mensagem no momento. Por favor, tente novamente."
    
    async def generate_team_suggestion(
        self, 
        preferences: Dict[str, any]
    ) -> str:
        """Gera sugestão de time baseado nas preferências do usuário"""
        
        prompt = f"""Com base nas seguintes preferências, sugira um time Pokémon competitivo:
        
Tipos favoritos: {preferences.get('favorite_types', 'Nenhum especificado')}
Geração: {preferences.get('generation', 'Qualquer')}
Estilo de jogo: {preferences.get('playstyle', 'Balanceado')}

Por favor, sugira 6 Pokémon com:
- Nome do Pokémon
- Tipo(s)
- Papel no time (Atacante, Defensor, Suporte, etc.)
- Breve justificativa da escolha
"""
        
        return await self.generate_response(prompt)
    
    async def analyze_matchup(
        self, 
        pokemon1: str, 
        pokemon2: str
    ) -> str:
        """Analisa o matchup entre dois Pokémon"""
        
        prompt = f"""Analise o matchup entre {pokemon1} e {pokemon2}:

1. Vantagens de tipo
2. Estatísticas comparadas
3. Movimentos efetivos
4. Estratégia recomendada
5. Qual tem vantagem e por quê?
"""
        
        return await self.generate_response(prompt)
    
    def check_ollama_connection(self) -> bool:
        """Verifica se o Ollama está disponível"""
        try:
            ollama.list()
            return True
        except Exception as e:
            print(f"Erro ao conectar com Ollama: {e}")
            return False


# Instância global (IMPORTANTE!)
llama_chat = LlamaChat()