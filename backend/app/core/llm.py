# backend/app/core/llm.py
from typing import List, Dict, Optional
import ollama
from app.core.config import settings


class LlamaService:
    """Serviço para interagir com o modelo Llama via Ollama."""
    
    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.base_url = settings.OLLAMA_BASE_URL
        self.client = ollama.Client(host=self.base_url)
    
    def generate_pokemon_response(
        self,
        user_message: str,
        conversation_history: List[Dict] = None,
        pokemon_data: Optional[str] = None
    ) -> str:
        """
        Gera resposta sobre Pokémon usando o modelo Llama.
        
        Args:
            user_message: Mensagem do usuário
            conversation_history: Histórico de conversa
            pokemon_data: Dados formatados do Pokémon (se houver)
        
        Returns:
            Resposta gerada pelo modelo
        """
        # Monta o prompt do sistema
        system_prompt = self._build_system_prompt(pokemon_data)
        
        # Monta as mensagens
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adiciona histórico se houver
        if conversation_history:
            messages.extend(conversation_history[-5:])  # Últimas 5 mensagens
        
        # Adiciona mensagem atual
        messages.append({"role": "user", "content": user_message})
        
        try:
            # Chama o Ollama
            response = self.client.chat(
                model=self.model,
                messages=messages,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            )
            
            return response['message']['content']
        
        except Exception as e:
            print(f"Erro ao gerar resposta: {e}")
            return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente!"
    
    def _build_system_prompt(self, pokemon_data: Optional[str] = None) -> str:
        """Constrói o prompt do sistema."""
        base_prompt = """Você é um assistente especializado em Pokémon, parte de uma Pokédex AI.
Seu papel é ajudar treinadores com informações sobre Pokémon, sugestões de times, estratégias e curiosidades.

DIRETRIZES:
- Seja amigável e entusiasta sobre Pokémon
- Forneça informações precisas e úteis
- Use linguagem clara e acessível
- Quando falar de stats, seja específico
- Sugira estratégias práticas
- Seja conciso mas informativo (máximo 3-4 parágrafos)

"""
        
        if pokemon_data:
            base_prompt += f"\nINFORMAÇÕES DO POKÉMON ATUAL:\n{pokemon_data}\n"
            base_prompt += "\nUse essas informações para dar uma resposta mais detalhada e precisa."
        
        return base_prompt
    
    def analyze_team(self, team_pokemon: List[str]) -> str:
        """Analisa um time de Pokémon e dá sugestões."""
        prompt = f"""Analise este time de Pokémon e forneça:
1. Pontos fortes do time
2. Fraquezas principais
3. Sugestões de melhoria

Time: {', '.join(team_pokemon)}

Seja específico sobre tipos e coberturas."""
        
        messages = [
            {"role": "system", "content": "Você é um especialista em análise de times Pokémon."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = self.client.chat(
                model=self.model,
                messages=messages,
                options={"temperature": 0.7}
            )
            return response['message']['content']
        except Exception as e:
            print(f"Erro na análise de time: {e}")
            return "Erro ao analisar o time."
    
    def suggest_counters(self, pokemon_name: str) -> str:
        """Sugere counters para um Pokémon específico."""
        prompt = f"""Sugira os 3 melhores counters para {pokemon_name}.
Para cada counter, explique brevemente por que é efetivo.
Considere tipos, stats e movesets comuns."""
        
        messages = [
            {"role": "system", "content": "Você é um especialista em estratégia Pokémon competitiva."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response = self.client.chat(
                model=self.model,
                messages=messages,
                options={"temperature": 0.7}
            )
            return response['message']['content']
        except Exception as e:
            print(f"Erro ao sugerir counters: {e}")
            return "Erro ao sugerir counters."


# Instância global do serviço
llama_service = LlamaService()