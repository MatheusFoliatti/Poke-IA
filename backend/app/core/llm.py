import ollama
from typing import Optional
from app.core.config import settings


class LlamaChat:
    """Classe para interagir com o modelo Llama via Ollama"""
    
    def __init__(self):
        self.model = settings.OLLAMA_MODEL
        self.system_prompt = """Você é um assistente especializado em Pokémon chamado PokédexAI.
Você ajuda treinadores com informações sobre Pokémon de forma clara e objetiva.

IMPORTANTE:
- Seja CONCISO: respostas com 3-5 frases no máximo
- Use emojis quando apropriado
- Foque nas informações mais relevantes
- Se tiver dados do Pokémon, mencione-os brevemente
- Para comparações, destaque as principais diferenças E RECOMENDE um deles com justificativa

Exemplo de boa resposta para single:
"Pikachu é um Pokémon Elétrico icônico! ⚡ Com 35 de HP e 55 de ataque, é rápido mas frágil. Perfeito para batalhas que exigem velocidade!"

Exemplo de boa resposta para comparação:
"Charizard tem mais ataque (84 vs 83) e velocidade superior (100 vs 78). 🔥 Blastoise é mais defensivo com 100 de defesa. ✅ Recomendo Charizard se você busca agressividade e velocidade, ideal para atacantes rápidos!"
"""
    
    async def generate_response(
        self, 
        user_message: str, 
        context: Optional[str] = None
    ) -> str:
        """Gera uma resposta usando o modelo Llama"""
        
        try:
            print(f"🤖 [LLM] Usando modelo: {self.model}")
            
            # Verificar se é uma comparação
            is_comparison = context and ("comparação" in context.lower() or "vs" in context.lower())
            
            # Construir mensagens
            messages = [
                {
                    'role': 'system',
                    'content': self.system_prompt
                }
            ]
            
            # Adicionar contexto se houver
            if context:
                if is_comparison:
                    messages.append({
                        'role': 'user',
                        'content': f"""Contexto:
{context}

Pergunta: {user_message}

Faça uma comparação completa:
1. Destaque as principais diferenças nas stats (2 frases)
2. RECOMENDE qual é melhor e JUSTIFIQUE baseado nas stats (2-3 frases)
3. Use emojis e seja objetivo"""
                    })
                else:
                    messages.append({
                        'role': 'user',
                        'content': f"Contexto:\n{context}\n\nPergunta: {user_message}"
                    })
            else:
                messages.append({
                    'role': 'user',
                    'content': user_message
                })
            
            print(f"📤 [LLM] Enviando mensagem para Ollama...")
            
            # Chamar o Ollama (sem passar base_url, usa localhost:11434 por padrão)
            response = ollama.chat(
                model=self.model,
                messages=messages
            )
            
            bot_response = response['message']['content']
            
            print(f"📥 [LLM] Resposta recebida: {bot_response[:100]}...")
            
            return bot_response
            
        except Exception as e:
            print(f"❌ [LLM] Erro ao gerar resposta: {e}")
            raise  # Re-raise para o chat_service tratar com fallback
    
    def check_ollama_connection(self) -> bool:
        """Verifica se o Ollama está disponível"""
        try:
            ollama.list()
            print("✅ [LLM] Ollama está disponível")
            return True
        except Exception as e:
            print(f"❌ [LLM] Ollama não está disponível: {e}")
            return False


# Instância global
llama_chat = LlamaChat()

# Verifica conexão ao importar
llama_chat.check_ollama_connection()