from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.llm import llama_chat
from app.db.models import ChatMessage, User
from app.services.pokeapi import pokeapi_service
import re
import random

# Armazenar última equipe gerada para evitar repetição
LAST_TEAM_IDS = []


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
        
        print(f"📝 [CHAT_SERVICE] Processando mensagem: {message}")
        
        # Salvar mensagem do usuário
        user_message = ChatMessage(
            user_id=user_id,
            content=message,
            is_bot=False,
            created_at=datetime.utcnow()
        )
        db.add(user_message)
        db.commit()
        
        print(f"💾 [CHAT_SERVICE] Mensagem do usuário salva no banco")
        
        # Detectar se menciona um Pokémon específico
        pokemon_data = await self._detect_and_fetch_pokemon(message)
        
        if pokemon_data:
            if pokemon_data.get('is_team'):
                print(f"🎯 [CHAT_SERVICE] Equipe detectada: {len(pokemon_data['team_list'])} Pokémon")
            elif pokemon_data.get('is_comparison'):
                print(f"🔍🔍 [CHAT_SERVICE] Comparação detectada: {len(pokemon_data['pokemon_list'])} Pokémon")
            else:
                print(f"🔍 [CHAT_SERVICE] Pokémon detectado: {pokemon_data['name']}")
        
        # Buscar histórico de conversas
        history = self._get_chat_history(user_id, db)
        
        # Gerar contexto para a LLM
        context = self._build_context(history, pokemon_data)
        
        print(f"🤖 [CHAT_SERVICE] Gerando resposta com Ollama...")
        
        # Gerar resposta da IA
        try:
            bot_response = await self.llama.generate_response(
                user_message=message,
                context=context
            )
            print(f"✅ [CHAT_SERVICE] Resposta gerada: {bot_response[:100]}...")
        except Exception as e:
            print(f"❌ [CHAT_SERVICE] Erro ao gerar resposta com Ollama: {e}")
            print(f"❌ [CHAT_SERVICE] Usando fallback...")
            
            # Fallback se Ollama falhar
            if pokemon_data:
                if pokemon_data.get('is_team'):
                    team_list = pokemon_data['team_list']
                    strategy = pokemon_data.get('strategy', {})
                    
                    team_names = ", ".join([p['name'].capitalize() for p in team_list])
                    bot_response = f"🎯 Equipe Sugerida: {team_names}! {strategy.get('description', '')} Veja os detalhes de cada membro nos cards abaixo! 🔥"
                    
                    print(f"✅ [FALLBACK] Equipe gerada: {team_names}")
                
                elif pokemon_data.get('is_comparison'):
                    pokemon_list = pokemon_data['pokemon_list']
                    p1 = pokemon_list[0]
                    p2 = pokemon_list[1]
                    
                    # Calcular totais
                    total1 = sum(p1['stats'].values())
                    total2 = sum(p2['stats'].values())
                    
                    print(f"📊 [FALLBACK] {p1['name']} total: {total1}")
                    print(f"📊 [FALLBACK] {p2['name']} total: {total2}")
                    
                    # Comparar stats principais
                    comparisons = []
                    
                    # Ataque
                    if p1['stats']['attack'] > p2['stats']['attack']:
                        comparisons.append(f"{p1['name'].capitalize()} tem mais ataque ({p1['stats']['attack']} vs {p2['stats']['attack']}) ⚔️")
                    elif p2['stats']['attack'] > p1['stats']['attack']:
                        comparisons.append(f"{p2['name'].capitalize()} tem mais ataque ({p2['stats']['attack']} vs {p1['stats']['attack']}) ⚔️")
                    
                    # Defesa
                    if p1['stats']['defense'] > p2['stats']['defense']:
                        comparisons.append(f"{p1['name'].capitalize()} é mais defensivo ({p1['stats']['defense']} vs {p2['stats']['defense']}) 🛡️")
                    elif p2['stats']['defense'] > p1['stats']['defense']:
                        comparisons.append(f"{p2['name'].capitalize()} é mais defensivo ({p2['stats']['defense']} vs {p1['stats']['defense']}) 🛡️")
                    
                    # Velocidade
                    if p1['stats']['speed'] > p2['stats']['speed']:
                        comparisons.append(f"{p1['name'].capitalize()} é mais rápido ({p1['stats']['speed']} vs {p2['stats']['speed']}) ⚡")
                    elif p2['stats']['speed'] > p1['stats']['speed']:
                        comparisons.append(f"{p2['name'].capitalize()} é mais rápido ({p2['stats']['speed']} vs {p1['stats']['speed']}) ⚡")
                    
                    # Recomendação
                    if total1 > total2:
                        diff = total1 - total2
                        recommended = p1['name'].capitalize()
                        reason = f"tem {diff} pontos a mais no total de stats ({total1} vs {total2})"
                    else:
                        diff = total2 - total1
                        recommended = p2['name'].capitalize()
                        reason = f"tem {diff} pontos a mais no total de stats ({total2} vs {total1})"
                    
                    # Montar resposta
                    comparison_text = ". ".join(comparisons)
                    bot_response = f"{comparison_text}. ✅ Recomendo {recommended} porque {reason}!"
                    
                    print(f"✅ [FALLBACK] Resposta gerada: {bot_response}")
                else:
                    bot_response = f"Encontrei {pokemon_data['name']}! É do tipo {', '.join(pokemon_data['types'])} com {pokemon_data['stats']['hp']} HP. Veja mais no card! 🔴"
            else:
                bot_response = "Olá! Pergunte-me sobre algum Pokémon específico! 🔴"
        
        # Salvar resposta do bot
        bot_message = ChatMessage(
            user_id=user_id,
            content=bot_response,
            is_bot=True,
            created_at=datetime.utcnow()
        )
        db.add(bot_message)
        db.commit()
        
        print(f"💾 [CHAT_SERVICE] Resposta do bot salva no banco")
        
        # LOGS DE DEBUG
        print(f"🎴 [CHAT_SERVICE] pokemon_data enviado:")
        if pokemon_data:
            if pokemon_data.get('is_team'):
                print(f"   - Tipo: Equipe")
                print(f"   - Quantidade: {len(pokemon_data.get('team_list', []))}")
                for poke in pokemon_data.get('team_list', []):
                    print(f"   - {poke.get('name')}: {poke.get('types')}")
            elif pokemon_data.get('is_comparison'):
                print(f"   - Tipo: Comparação")
                print(f"   - Quantidade: {len(pokemon_data.get('pokemon_list', []))}")
                for poke in pokemon_data.get('pokemon_list', []):
                    print(f"   - {poke.get('name')}: {poke.get('types')}")
            else:
                print(f"   - id: {pokemon_data.get('id')}")
                print(f"   - name: {pokemon_data.get('name')}")
                print(f"   - types: {pokemon_data.get('types')}")
                print(f"   - stats: {pokemon_data.get('stats')}")
                print(f"   - sprites: {pokemon_data.get('sprites')}")
        else:
            print(f"   - pokemon_data é None")
        
        return {
            "user_message": message,
            "bot_response": bot_response,
            "pokemon_data": pokemon_data,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    def _get_chat_history(self, user_id: int, db: Session, limit: int = 5):
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
        
        # Lista de palavras-chave que indicam busca de Pokémon
        keywords = ['sobre', 'pokemon', 'pokémon', 'informações', 'stats', 'detalhes', 'fale', 'mostre', 'compare', 'comparar', 'versus', 'vs', 'equipe', 'time', 'monte']
        
        message_lower = message.lower()
        
        # Verifica se tem palavra-chave
        has_keyword = any(keyword in message_lower for keyword in keywords)
        
        if not has_keyword:
            return None
        
        # Detectar pedido de equipe
        team_filters = await self._detect_team_request(message)
        if team_filters.get('is_team_request'):
            return await self._generate_balanced_team(team_filters)
        
        # Detectar múltiplos Pokémon (para comparações)
        if 'compare' in message_lower or 'comparar' in message_lower or 'versus' in message_lower or ' vs ' in message_lower or ' e ' in message_lower:
            return await self._detect_multiple_pokemon(message)
        
        # Remove palavras comuns para extrair o nome do Pokémon
        words_to_remove = ['me', 'fale', 'sobre', 'o', 'a', 'pokemon', 'pokémon', 'quais', 'são', 'as', 'stats', 'do', 'da', 'de', 'mostre', 'informações']
        
        words = message_lower.split()
        pokemon_name = None
        
        for word in words:
            # Remove pontuação
            clean_word = word.strip('?!.,')
            
            if clean_word not in words_to_remove and len(clean_word) > 2:
                pokemon_name = clean_word
                break
        
        if not pokemon_name:
            return None
        
        print(f"🔍 [CHAT_SERVICE] Tentando buscar Pokémon: {pokemon_name}")
        
        try:
            pokemon_data = await pokeapi_service.get_pokemon(pokemon_name)
            if pokemon_data:
                print(f"✅ [CHAT_SERVICE] Pokémon encontrado: {pokemon_data['name']}")
            return pokemon_data
        except Exception as e:
            print(f"❌ [CHAT_SERVICE] Pokémon não encontrado: {e}")
            return None
    
    async def _detect_multiple_pokemon(self, message: str) -> Optional[dict]:
        """Detecta e busca múltiplos Pokémon para comparação"""
        
        print(f"🔍🔍 [CHAT_SERVICE] Detectando múltiplos Pokémon para comparação")
        
        # Remove palavras comuns
        words_to_remove = ['me', 'fale', 'sobre', 'o', 'a', 'pokemon', 'pokémon', 'quais', 'são', 'as', 'stats', 'do', 'da', 'de', 'mostre', 'informações', 'compare', 'comparar', 'versus', 'vs', 'entre', 'com']
        
        message_lower = message.lower()
        words = message_lower.split()
        
        pokemon_names = []
        for word in words:
            clean_word = word.strip('?!.,')
            if clean_word not in words_to_remove and len(clean_word) > 2:
                pokemon_names.append(clean_word)
        
        # Buscar até 2 Pokémon
        pokemon_list = []
        for name in pokemon_names[:2]:  # Limitar a 2 para comparação
            try:
                print(f"🔍 [CHAT_SERVICE] Tentando buscar: {name}")
                pokemon_data = await pokeapi_service.get_pokemon(name)
                if pokemon_data:
                    pokemon_list.append(pokemon_data)
                    print(f"✅ [CHAT_SERVICE] Pokémon encontrado: {pokemon_data['name']}")
            except Exception as e:
                print(f"❌ [CHAT_SERVICE] Erro ao buscar {name}: {e}")
        
        if len(pokemon_list) >= 2:
            print(f"✅✅ [CHAT_SERVICE] Comparação: {pokemon_list[0]['name']} vs {pokemon_list[1]['name']}")
            return {
                'is_comparison': True,
                'pokemon_list': pokemon_list
            }
        elif len(pokemon_list) == 1:
            # Se encontrou apenas 1, retornar como single
            return pokemon_list[0]
        else:
            return None
    
    async def _detect_team_request(self, message: str) -> dict:
        """Detecta pedido de equipe e extrai filtros"""
        keywords = ['equipe', 'time', 'team', 'monte', 'montar', 'sugira', 'sugestão', 'recomende']
        message_lower = message.lower()
        
        if not any(keyword in message_lower for keyword in keywords):
            return {'is_team_request': False}
        
        # Detectar filtros específicos
        filters = {
            'is_team_request': True,
            'type_filter': None,
            'strategy_filter': None
        }
        
        # Filtros de tipo
        types = ['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'dragon', 
                 'ghost', 'ice', 'rock', 'ground', 'flying', 'poison', 'bug', 'normal',
                 'dark', 'steel', 'fairy', 'fogo', 'água', 'grama', 'elétrico', 'fantasma',
                 'gelo', 'pedra', 'voador', 'venenoso', 'inseto', 'lutador', 'sombrio',
                 'metálico', 'fada', 'dragão', 'psíquico']
        
        type_mapping = {
            'fogo': 'fire', 'água': 'water', 'grama': 'grass', 
            'elétrico': 'electric', 'fantasma': 'ghost', 'gelo': 'ice',
            'pedra': 'rock', 'voador': 'flying', 'venenoso': 'poison',
            'inseto': 'bug', 'lutador': 'fighting', 'sombrio': 'dark',
            'metálico': 'steel', 'fada': 'fairy', 'dragão': 'dragon',
            'psíquico': 'psychic'
        }
        
        for poke_type in types:
            if poke_type in message_lower:
                filters['type_filter'] = type_mapping.get(poke_type, poke_type)
                print(f"🔍 [TEAM] Filtro de tipo detectado: {filters['type_filter']}")
                break
        
        # Filtros de estratégia
        if 'rápid' in message_lower or 'veloz' in message_lower or 'speed' in message_lower:
            filters['strategy_filter'] = 'speed'
            print(f"🔍 [TEAM] Filtro de estratégia: speed")
        elif 'tank' in message_lower or 'defensiv' in message_lower or 'resistent' in message_lower:
            filters['strategy_filter'] = 'tank'
            print(f"🔍 [TEAM] Filtro de estratégia: tank")
        elif 'ataque' in message_lower or 'atacante' in message_lower or 'offensive' in message_lower or 'ofensiv' in message_lower:
            filters['strategy_filter'] = 'offensive'
            print(f"🔍 [TEAM] Filtro de estratégia: offensive")
        elif 'balanceado' in message_lower or 'equilibrado' in message_lower or 'balanced' in message_lower:
            filters['strategy_filter'] = 'balanced'
            print(f"🔍 [TEAM] Filtro de estratégia: balanced")
        
        return filters
    
    async def _generate_balanced_team(self, filters: dict = None) -> Optional[dict]:
        """Gera uma equipe balanceada com filtros opcionais"""
        
        global LAST_TEAM_IDS
        
        print(f"🎯 [CHAT_SERVICE] Gerando equipe com filtros: {filters}")
        
        if filters is None:
            filters = {}
        
        type_filter = filters.get('type_filter')
        strategy_filter = filters.get('strategy_filter')
        
        try:
            team_list = []
            attempts = 0
            max_attempts = 50  # Máximo de tentativas para evitar loop infinito
            
            # Se tem filtro de tipo específico
            if type_filter:
                print(f"🔍 [TEAM] Buscando Pokémon do tipo: {type_filter}")
                type_pokemon_ids = await pokeapi_service.get_pokemon_by_type(type_filter, limit=100)
                
                if type_pokemon_ids:
                    # Filtrar IDs que não estavam na última equipe
                    available_ids = [pid for pid in type_pokemon_ids if pid not in LAST_TEAM_IDS]
                    
                    if len(available_ids) < 6:
                        # Se não tem suficientes, usar todos
                        available_ids = type_pokemon_ids
                    
                    # Selecionar 6 aleatórios desse tipo
                    selected_ids = random.sample(available_ids, min(6, len(available_ids)))
                else:
                    print(f"⚠️ [TEAM] Nenhum Pokémon encontrado para o tipo {type_filter}")
                    return None
            else:
                # Geração balanceada: 1 de cada tipo principal
                main_types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon']
                selected_ids = []
                
                for poke_type in main_types:
                    type_pokemon_ids = await pokeapi_service.get_pokemon_by_type(poke_type, limit=50)
                    if type_pokemon_ids:
                        # Filtrar IDs que não estavam na última equipe
                        available_ids = [pid for pid in type_pokemon_ids if pid not in LAST_TEAM_IDS]
                        
                        if not available_ids:
                            available_ids = type_pokemon_ids
                        
                        # Escolher um aleatório desse tipo
                        chosen_id = random.choice(available_ids)
                        selected_ids.append(chosen_id)
            
            # Buscar dados de cada Pokémon
            for pokemon_id in selected_ids:
                if attempts >= max_attempts:
                    print(f"⚠️ [TEAM] Máximo de tentativas atingido")
                    break
                
                try:
                    print(f"🔍 [TEAM] Buscando ID {pokemon_id}")
                    pokemon_data = await pokeapi_service.get_pokemon(pokemon_id)
                    
                    if pokemon_data:
                        # Aplicar filtro de estratégia
                        if strategy_filter:
                            if not self._matches_strategy(pokemon_data, strategy_filter):
                                print(f"⏭️ [TEAM] {pokemon_data['name']} não se encaixa na estratégia {strategy_filter}")
                                attempts += 1
                                continue
                        
                        team_list.append(pokemon_data)
                        print(f"✅ [TEAM] Adicionado: {pokemon_data['name']}")
                        
                except Exception as e:
                    print(f"❌ [TEAM] Erro ao buscar ID {pokemon_id}: {e}")
                    attempts += 1
            
            # Completar equipe se necessário (sem filtro de estratégia rígido)
            while len(team_list) < 6 and attempts < max_attempts:
                try:
                    if type_filter and type_pokemon_ids:
                        random_id = random.choice(type_pokemon_ids)
                    else:
                        random_id = random.randint(1, 1025)
                    
                    if random_id not in LAST_TEAM_IDS and random_id not in [p['id'] for p in team_list]:
                        pokemon_data = await pokeapi_service.get_pokemon(random_id)
                        if pokemon_data:
                            team_list.append(pokemon_data)
                            print(f"✅ [TEAM] Completando equipe: {pokemon_data['name']}")
                except:
                    pass
                
                attempts += 1
            
            if len(team_list) >= 6:
                # Atualizar lista de IDs da última equipe
                LAST_TEAM_IDS = [p['id'] for p in team_list]
                
                print(f"✅ [TEAM] Equipe completa com {len(team_list)} Pokémon")
                print(f"🎲 [TEAM] IDs: {LAST_TEAM_IDS}")
                
                return {
                    'is_team': True,
                    'team_list': team_list,
                    'strategy': self._generate_team_strategy(team_list, type_filter, strategy_filter)
                }
            else:
                print(f"⚠️ [TEAM] Equipe incompleta: {len(team_list)} Pokémon")
                return None
                
        except Exception as e:
            print(f"❌ [TEAM] Erro ao gerar equipe: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _matches_strategy(self, pokemon_data: dict, strategy: str) -> bool:
        """Verifica se um Pokémon se encaixa na estratégia"""
        stats = pokemon_data['stats']
        
        if strategy == 'speed':
            # Pokémon rápidos: speed > 100
            return stats['speed'] >= 100
        elif strategy == 'tank':
            # Pokémon tanques: defense + special-defense > 150
            return (stats['defense'] + stats['special-defense']) >= 150
        elif strategy == 'offensive':
            # Pokémon ofensivos: attack ou special-attack > 100
            return stats['attack'] >= 100 or stats['special-attack'] >= 100
        elif strategy == 'balanced':
            # Pokémon balanceados: nenhuma stat muito baixa
            return all(stat >= 50 for stat in stats.values())
        
        return True  # Se não tem estratégia, aceita qualquer um
    def _generate_team_strategy(self, team_list: list, type_filter: str = None, strategy_filter: str = None) -> dict:
        """Gera estratégia da equipe baseada nos membros"""
        
        # Analisar composição
        types_count = {}
        roles = []
        
        for pokemon in team_list:
            # Contar tipos
            for poke_type in pokemon['types']:
                types_count[poke_type] = types_count.get(poke_type, 0) + 1
            
            # Determinar role baseado em stats
            stats = pokemon['stats']
            
            if stats['speed'] >= 100:
                if stats['attack'] >= 100 or stats['special-attack'] >= 100:
                    roles.append(f"{pokemon['name'].capitalize()}: Sweeper Rápido")
                else:
                    roles.append(f"{pokemon['name'].capitalize()}: Suporte Veloz")
            elif stats['attack'] >= 100 or stats['special-attack'] >= 100:
                roles.append(f"{pokemon['name'].capitalize()}: Atacante Pesado")
            elif stats['defense'] >= 100 or stats['special-defense'] >= 100:
                roles.append(f"{pokemon['name'].capitalize()}: Tank Defensivo")
            else:
                roles.append(f"{pokemon['name'].capitalize()}: Versátil")
        
        # Gerar título baseado em filtros
        if type_filter:
            type_names = {
                'fire': 'Fogo', 'water': 'Água', 'grass': 'Grama',
                'electric': 'Elétrico', 'psychic': 'Psíquico', 'fighting': 'Lutador',
                'dragon': 'Dragão', 'ghost': 'Fantasma', 'ice': 'Gelo',
                'rock': 'Pedra', 'ground': 'Terra', 'flying': 'Voador',
                'poison': 'Venenoso', 'bug': 'Inseto', 'normal': 'Normal',
                'dark': 'Sombrio', 'steel': 'Metálico', 'fairy': 'Fada'
            }
            type_display = type_names.get(type_filter, type_filter.capitalize())
            title = f"Equipe {type_display} Especializada"
            description = f"Uma equipe focada no tipo {type_display}, com excelente sinergia elemental"
        elif strategy_filter == 'speed':
            title = "Equipe Speed Blitz"
            description = "Time ultra-rápido focado em atacar primeiro e dominar o ritmo da batalha"
        elif strategy_filter == 'tank':
            title = "Equipe Fortaleza"
            description = "Time defensivo projetado para resistir e contra-atacar estrategicamente"
        elif strategy_filter == 'offensive':
            title = "Equipe Agressiva"
            description = "Time ofensivo com poder de fogo devastador para eliminar oponentes rapidamente"
        elif strategy_filter == 'balanced':
            title = "Equipe Harmonia"
            description = "Time equilibrado sem pontos fracos aparentes, versátil para qualquer situação"
        else:
            title = "Equipe Balanceada Universal"
            description = "Uma equipe versátil com boa cobertura de tipos e estratégias variadas"
        
        # Calcular stats médias
        avg_stats = {
            'hp': sum(p['stats']['hp'] for p in team_list) // len(team_list),
            'attack': sum(p['stats']['attack'] for p in team_list) // len(team_list),
            'defense': sum(p['stats']['defense'] for p in team_list) // len(team_list),
            'speed': sum(p['stats']['speed'] for p in team_list) // len(team_list),
        }
        
        # Determinar pontos fortes
        strengths = []
        if len(set(types_count.keys())) >= 5:
            strengths.append("Excelente cobertura de tipos")
        elif type_filter:
            strengths.append(f"Especialização total em {type_filter}")
        
        if avg_stats['speed'] >= 90:
            strengths.append("Alta velocidade média do time")
        if avg_stats['attack'] >= 85:
            strengths.append("Forte poder ofensivo")
        if avg_stats['defense'] >= 85:
            strengths.append("Boa resistência defensiva")
        
        if not strengths:
            strengths.append("Time equilibrado e versátil")
        
        # Adicionar estatísticas
        strengths.append(f"HP médio: {avg_stats['hp']}")
        
        return {
            'title': title,
            'description': description,
            'type_coverage': list(types_count.keys()),
            'roles': roles,
            'strengths': strengths,
            'avg_stats': avg_stats
        }
    
    def _build_context(self, history: list, pokemon_data: Optional[dict]) -> str:
        """Constrói contexto para a LLM"""
        context_parts = []
        
        # Adicionar dados do Pokémon se disponível
        if pokemon_data:
            # Verificar se é equipe
            if pokemon_data.get('is_team') and pokemon_data.get('team_list'):
                team_list = pokemon_data['team_list']
                strategy = pokemon_data.get('strategy', {})
                
                context_parts.append(f"Equipe Sugerida com {len(team_list)} Pokémon:")
                context_parts.append(f"\nEstratégia: {strategy.get('title', 'Equipe Balanceada')}")
                context_parts.append(f"Descrição: {strategy.get('description', '')}")
                
                context_parts.append(f"\nMembros da Equipe:")
                for i, poke in enumerate(team_list, 1):
                    context_parts.append(f"\n{i}. {poke['name'].upper()} ({', '.join(poke['types'])})")
                    context_parts.append(f"   - Total Stats: {sum(poke['stats'].values())}")
                
                context_parts.append(f"\nRoles:")
                for role in strategy.get('roles', []):
                    context_parts.append(f"- {role}")
                
                context_parts.append(f"\nPontos Fortes:")
                for strength in strategy.get('strengths', []):
                    context_parts.append(f"✅ {strength}")
            
            # Verificar se é comparação
            elif pokemon_data.get('is_comparison') and pokemon_data.get('pokemon_list'):
                pokemon_list = pokemon_data['pokemon_list']
                context_parts.append(f"Comparação entre {len(pokemon_list)} Pokémon:")
                
                for i, poke in enumerate(pokemon_list, 1):
                    context_parts.append(f"\n{i}. {poke['name'].upper()}:")
                    context_parts.append(f"   - Tipos: {', '.join(poke['types'])}")
                    context_parts.append(f"   - HP: {poke['stats']['hp']}")
                    context_parts.append(f"   - Ataque: {poke['stats']['attack']}")
                    context_parts.append(f"   - Defesa: {poke['stats']['defense']}")
                    context_parts.append(f"   - Ataque Especial: {poke['stats']['special-attack']}")
                    context_parts.append(f"   - Defesa Especial: {poke['stats']['special-defense']}")
                    context_parts.append(f"   - Velocidade: {poke['stats']['speed']}")
                    total = sum(poke['stats'].values())
                    context_parts.append(f"   - Total: {total}")
                
                # Adicionar análise automática
                analysis = self._analyze_comparison(pokemon_list)
                if analysis:
                    context_parts.append(f"\nAnálise Rápida:")
                    context_parts.append(analysis)
            else:
                # Single Pokémon
                context_parts.append(f"Informações sobre {pokemon_data['name']}:")
                context_parts.append(f"- Tipos: {', '.join(pokemon_data['types'])}")
                context_parts.append(f"- HP: {pokemon_data['stats']['hp']}")
                context_parts.append(f"- Ataque: {pokemon_data['stats']['attack']}")
                context_parts.append(f"- Defesa: {pokemon_data['stats']['defense']}")
                context_parts.append(f"- Velocidade: {pokemon_data['stats']['speed']}")
        
        # Adicionar histórico (últimas mensagens)
        if history:
            context_parts.append("\nHistórico recente:")
            for msg in history[-3:]:  # Últimas 3 mensagens
                role = "Usuário" if msg["role"] == "user" else "Assistente"
                context_parts.append(f"{role}: {msg['content']}")
        
        return "\n".join(context_parts)
    
    def _analyze_comparison(self, pokemon_list: list) -> str:
        """Analisa comparação e gera insights"""
        if len(pokemon_list) < 2:
            return ""
        
        p1 = pokemon_list[0]
        p2 = pokemon_list[1]
        
        # Calcular totais
        total1 = sum(p1['stats'].values())
        total2 = sum(p2['stats'].values())
        
        # Análise básica
        analysis = []
        
        # Comparar stats individuais
        if p1['stats']['attack'] > p2['stats']['attack']:
            analysis.append(f"{p1['name']} tem mais ataque ({p1['stats']['attack']} vs {p2['stats']['attack']})")
        else:
            analysis.append(f"{p2['name']} tem mais ataque ({p2['stats']['attack']} vs {p1['stats']['attack']})")
        
        if p1['stats']['defense'] > p2['stats']['defense']:
            analysis.append(f"{p1['name']} é mais defensivo ({p1['stats']['defense']} vs {p2['stats']['defense']})")
        else:
            analysis.append(f"{p2['name']} é mais defensivo ({p2['stats']['defense']} vs {p1['stats']['defense']})")
        
        if p1['stats']['speed'] > p2['stats']['speed']:
            analysis.append(f"{p1['name']} é mais rápido ({p1['stats']['speed']} vs {p2['stats']['speed']})")
        else:
            analysis.append(f"{p2['name']} é mais rápido ({p2['stats']['speed']} vs {p1['stats']['speed']})")
        
        # Recomendação baseada em total
        if total1 > total2:
            diff = total1 - total2
            analysis.append(f"\n✅ Recomendação: {p1['name'].upper()} tem {diff} pontos a mais no total ({total1} vs {total2})")
        else:
            diff = total2 - total1
            analysis.append(f"\n✅ Recomendação: {p2['name'].upper()} tem {diff} pontos a mais no total ({total2} vs {total1})")
        
        return "\n".join(analysis)
    
    async def get_chat_history_for_user(self, user_id: int, db: Session):
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
                "timestamp": msg.created_at.isoformat() + "Z"
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
            print(f"❌ [CHAT_SERVICE] Erro ao limpar histórico: {e}")
            db.rollback()
            return False


# Instância global do serviço
chat_service = ChatService()
