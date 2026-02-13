from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.llm import llama_chat
from app.db.models import ChatMessage, User
from app.services.pokeapi import pokeapi_service
import re
import random
from difflib import get_close_matches
import asyncio

# Armazenar última equipe gerada para evitar repetição
LAST_TEAM_IDS = []

# Cache global de todos os nomes de Pokémon
POKEMON_NAMES_CACHE = []
CACHE_LOADED = False
CACHE_LOCK = asyncio.Lock()


async def load_pokemon_names_cache():
    """Carrega cache de nomes de Pokémon (executado uma vez)"""
    global POKEMON_NAMES_CACHE, CACHE_LOADED

    async with CACHE_LOCK:
        if CACHE_LOADED:
            return  # Já foi carregado

        print("🔄 [CACHE] Carregando nomes de todos os Pokémon...")
        POKEMON_NAMES_CACHE = await pokeapi_service.get_all_pokemon_names()
        CACHE_LOADED = True
        print(f"✅ [CACHE] {len(POKEMON_NAMES_CACHE)} nomes em cache")


class ChatService:
    def __init__(self):
        self.llama = llama_chat

    async def process_message(self, message: str, user_id: int, db: Session) -> dict:
        """Processa uma mensagem do usuário e retorna a resposta da IA"""
        print(f"📝 [CHAT_SERVICE] Processando mensagem: {message}")

        # Salvar mensagem do usuário
        user_message = ChatMessage(
            user_id=user_id, content=message, is_bot=False, created_at=datetime.utcnow()
        )
        db.add(user_message)
        db.commit()

        print(f"💾 [CHAT_SERVICE] Mensagem do usuário salva no banco")

        # Detectar se menciona um Pokémon específico
        pokemon_data = await self._detect_and_fetch_pokemon(message)

        if pokemon_data:
            if pokemon_data.get("is_team"):
                print(
                    f"🎯 [CHAT_SERVICE] Equipe detectada: {len(pokemon_data['team_list'])} Pokémon"
                )
            elif pokemon_data.get("is_comparison"):
                print(
                    f"🔍🔍 [CHAT_SERVICE] Comparação detectada: {len(pokemon_data['pokemon_list'])} Pokémon"
                )
            else:
                print(f"🔍 [CHAT_SERVICE] Pokémon detectado: {pokemon_data['name']}")

        # Buscar histórico de conversas
        history = self._get_chat_history(user_id, db)

        # Gerar contexto para a LLM
        context = self._build_context(history, pokemon_data)

        print(f"🤖 [CHAT_SERVICE] Gerando resposta com Ollama...")

        # Gerar resposta da IA
        try:
            bot_response = await self.llama.generate_response(user_message=message, context=context)
            print(f"✅ [CHAT_SERVICE] Resposta gerada: {bot_response[:100]}...")
        except Exception as e:
            print(f"❌ [CHAT_SERVICE] Erro ao gerar resposta com Ollama: {e}")
            print(f"❌ [CHAT_SERVICE] Usando fallback...")
            bot_response = self._generate_fallback_response(pokemon_data)

        # Salvar resposta do bot
        bot_message = ChatMessage(
            user_id=user_id, content=bot_response, is_bot=True, created_at=datetime.utcnow()
        )
        db.add(bot_message)
        db.commit()

        print(f"💾 [CHAT_SERVICE] Resposta do bot salva no banco")

        return {
            "user_message": message,
            "bot_response": bot_response,
            "pokemon_data": pokemon_data,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    def _generate_fallback_response(self, pokemon_data):
        """Gera resposta fallback quando Ollama falha"""
        if not pokemon_data:
            return "Olá! Pergunte-me sobre algum Pokémon específico! 🔴"

        if pokemon_data.get("is_team"):
            team_list = pokemon_data["team_list"]
            strategy = pokemon_data.get("strategy", {})
            team_names = ", ".join([p["name"].capitalize() for p in team_list])
            return f"🎯 Equipe Sugerida: {team_names}! {strategy.get('description', '')} Veja os detalhes nos cards! 🔥"

        if pokemon_data.get("is_comparison"):
            pokemon_list = pokemon_data["pokemon_list"]
            p1, p2 = pokemon_list[0], pokemon_list[1]
            total1, total2 = sum(p1["stats"].values()), sum(p2["stats"].values())

            comparisons = []
            if p1["stats"]["attack"] != p2["stats"]["attack"]:
                winner = p1 if p1["stats"]["attack"] > p2["stats"]["attack"] else p2
                loser = p2 if winner == p1 else p1
                comparisons.append(
                    f"{winner['name'].capitalize()} tem mais ataque ({winner['stats']['attack']} vs {loser['stats']['attack']}) ⚔️"
                )

            if p1["stats"]["defense"] != p2["stats"]["defense"]:
                winner = p1 if p1["stats"]["defense"] > p2["stats"]["defense"] else p2
                loser = p2 if winner == p1 else p1
                comparisons.append(
                    f"{winner['name'].capitalize()} é mais defensivo ({winner['stats']['defense']} vs {loser['stats']['defense']}) 🛡️"
                )

            if p1["stats"]["speed"] != p2["stats"]["speed"]:
                winner = p1 if p1["stats"]["speed"] > p2["stats"]["speed"] else p2
                loser = p2 if winner == p1 else p1
                comparisons.append(
                    f"{winner['name'].capitalize()} é mais rápido ({winner['stats']['speed']} vs {loser['stats']['speed']}) ⚡"
                )

            recommended = p1["name"].capitalize() if total1 > total2 else p2["name"].capitalize()
            diff = abs(total1 - total2)
            reason = f"tem {diff} pontos a mais no total ({max(total1, total2)} vs {min(total1, total2)})"

            return f"{'. '.join(comparisons)}. ✅ Recomendo {recommended} porque {reason}!"

        # Single Pokémon
        return f"Encontrei {pokemon_data['name']}! É do tipo {', '.join(pokemon_data['types'])} com {pokemon_data['stats']['hp']} HP. Veja mais no card! 🔴"

    def _get_chat_history(self, user_id: int, db: Session, limit: int = 5):
        """Busca histórico recente de mensagens"""
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {"role": "assistant" if msg.is_bot else "user", "content": msg.content}
            for msg in reversed(messages)
        ]

    async def _try_fuzzy_pokemon_name(self, word: str) -> Optional[str]:
        """Tenta corrigir erros de digitação usando fuzzy matching com TODOS os Pokémon"""

        # Garantir que o cache está carregado
        if not CACHE_LOADED:
            await load_pokemon_names_cache()

        # Mapeamento manual de erros MUITO comuns (mais rápido que fuzzy)
        common_typos = {
            "raiquza": "rayquaza",
            "raikaisa": "rayquaza",
            "raikasa": "rayquaza",
            "pikaxu": "pikachu",
            "pikacho": "pikachu",
            "charisard": "charizard",
            "charizart": "charizard",
            "miutu": "mewtwo",
            "mewtu": "mewtwo",
            "mewtwu": "mewtwo",
            "blastois": "blastoise",
            "venuzaur": "venusaur",
            "venosaur": "venusaur",
            "dragonit": "dragonite",
            "dragonaite": "dragonite",
            "genghar": "gengar",
            "snorlacks": "snorlax",
            "girathina": "giratina",
            "arceos": "arceus",
            "lukario": "lucario",
            "arboc": "arbok",
            "arbock": "arbok",
            "ekens": "ekans",
            "evee": "eevee",
            "eeve": "eevee",
        }

        word_lower = word.lower()

        # 1. Busca exata no mapeamento manual (mais rápido)
        if word_lower in common_typos:
            corrected = common_typos[word_lower]
            print(f"🔧 [TYPO] Correção manual: '{word}' -> '{corrected}'")
            return corrected

        # 2. Fuzzy matching com TODOS os Pokémon (cache completo)
        if POKEMON_NAMES_CACHE:
            # Tentar com cutoff alto primeiro (mais preciso)
            matches = get_close_matches(word_lower, POKEMON_NAMES_CACHE, n=1, cutoff=0.75)

            if matches:
                corrected = matches[0]
                print(f"🔧 [TYPO] Fuzzy match (75%): '{word}' -> '{corrected}'")
                return corrected

            # Se não encontrou, tentar com cutoff mais baixo
            matches = get_close_matches(word_lower, POKEMON_NAMES_CACHE, n=1, cutoff=0.6)

            if matches:
                corrected = matches[0]
                print(f"🔧 [TYPO] Fuzzy match (60%): '{word}' -> '{corrected}'")
                return corrected

        # 3. Busca por prefixo (primeiras 4 letras)
        if len(word_lower) >= 4 and POKEMON_NAMES_CACHE:
            for pokemon in POKEMON_NAMES_CACHE:
                if len(pokemon) >= 4 and word_lower[:4] == pokemon[:4]:
                    print(f"🔧 [TYPO] Prefixo match: '{word}' -> '{pokemon}'")
                    return pokemon

        print(f"⚠️ [TYPO] Nenhuma correção encontrada para: '{word}'")
        return None

    async def _detect_and_fetch_pokemon(self, message: str) -> Optional[dict]:
        """Detecta menção a Pokémon e busca dados da PokéAPI"""
        message_lower = message.lower()

        # Detectar pedido de equipe PRIMEIRO
        team_keywords = [
            "equipe",
            "time",
            "team",
            "monte",
            "montar",
            "sugira",
            "sugestão",
            "recomende",
        ]
        if any(keyword in message_lower for keyword in team_keywords):
            team_filters = await self._detect_team_request(message)
            if team_filters.get("is_team_request"):
                return await self._generate_balanced_team(team_filters)

        # Detectar comparação
        comparison_keywords = ["compare", "comparar", "versus", " vs ", " x "]
        if any(keyword in message_lower for keyword in comparison_keywords):
            return await self._detect_multiple_pokemon(message)

        # Busca de Pokémon único
        words_to_remove = [
            "me",
            "fale",
            "sobre",
            "o",
            "a",
            "pokemon",
            "pokémon",
            "quais",
            "são",
            "as",
            "stats",
            "do",
            "da",
            "de",
            "mostre",
            "informações",
            "info",
            "qual",
            "quero",
            "saber",
            "conhecer",
            "ver",
            "mostra",
            "conta",
            "seobre",
        ]

        words = message_lower.split()

        # Primeira tentativa: cada palavra
        for word in words:
            clean_word = word.strip("?!.,;:")
            if len(clean_word) <= 2 or clean_word in words_to_remove:
                continue

            # Tentar buscar direto primeiro
            print(f"🔍 [CHAT_SERVICE] Tentando buscar direto: {clean_word}")
            try:
                pokemon_data = await pokeapi_service.get_pokemon(clean_word)
                if pokemon_data:
                    print(f"✅ [CHAT_SERVICE] Pokémon encontrado direto: {pokemon_data['name']}")
                    return pokemon_data
            except:
                pass

            # Se não encontrou, tentar correção com fuzzy matching
            corrected_word = await self._try_fuzzy_pokemon_name(clean_word)
            if corrected_word and corrected_word != clean_word:
                print(f"🔍 [CHAT_SERVICE] Tentando com correção: {corrected_word}")
                try:
                    pokemon_data = await pokeapi_service.get_pokemon(corrected_word)
                    if pokemon_data:
                        print(
                            f"✅ [CHAT_SERVICE] Pokémon encontrado com correção: {pokemon_data['name']}"
                        )
                        return pokemon_data
                except:
                    pass

        # Segunda tentativa: palavra mais longa
        longest_word = max(
            (w.strip("?!.,;:") for w in words if w.strip("?!.,;:") not in words_to_remove),
            key=len,
            default=None,
        )

        if longest_word and len(longest_word) >= 3:
            # Tentar direto
            print(f"🔍 [CHAT_SERVICE] Tentando palavra mais longa: {longest_word}")
            try:
                pokemon_data = await pokeapi_service.get_pokemon(longest_word)
                if pokemon_data:
                    return pokemon_data
            except:
                pass

            # Tentar com correção
            corrected = await self._try_fuzzy_pokemon_name(longest_word)
            if corrected and corrected != longest_word:
                print(f"🔍 [CHAT_SERVICE] Tentando correção da palavra longa: {corrected}")
                try:
                    pokemon_data = await pokeapi_service.get_pokemon(corrected)
                    if pokemon_data:
                        return pokemon_data
                except:
                    pass

        print(f"❌ [CHAT_SERVICE] Nenhum Pokémon identificado: {message}")
        return None

    async def _detect_multiple_pokemon(self, message: str) -> Optional[dict]:
        """Detecta múltiplos Pokémon para comparação"""
        print(f"🔍🔍 [CHAT_SERVICE] Detectando comparação")

        words_to_remove = [
            "me",
            "fale",
            "sobre",
            "o",
            "a",
            "pokemon",
            "pokémon",
            "compare",
            "comparar",
            "versus",
            "vs",
            "entre",
            "com",
            "e",
        ]

        words = message.lower().split()
        pokemon_names = [
            w.strip("?!.,")
            for w in words
            if w.strip("?!.,") not in words_to_remove and len(w.strip("?!.,")) > 2
        ]

        pokemon_list = []
        for name in pokemon_names[:2]:
            try:
                pokemon_data = await pokeapi_service.get_pokemon(name)
                if pokemon_data:
                    pokemon_list.append(pokemon_data)
            except:
                # Tentar com fuzzy matching
                corrected = await self._try_fuzzy_pokemon_name(name)
                if corrected:
                    try:
                        pokemon_data = await pokeapi_service.get_pokemon(corrected)
                        if pokemon_data:
                            pokemon_list.append(pokemon_data)
                    except:
                        pass

        if len(pokemon_list) >= 2:
            return {"is_comparison": True, "pokemon_list": pokemon_list}
        elif len(pokemon_list) == 1:
            return pokemon_list[0]
        return None

    async def _detect_team_request(self, message: str) -> dict:
        """Detecta pedido de equipe e filtros"""
        message_lower = message.lower()

        filters = {"is_team_request": True, "type_filter": None, "strategy_filter": None}

        type_mapping = {
            "fogo": "fire",
            "água": "water",
            "grama": "grass",
            "elétrico": "electric",
            "fantasma": "ghost",
            "gelo": "ice",
            "pedra": "rock",
            "voador": "flying",
            "venenoso": "poison",
            "inseto": "bug",
            "lutador": "fighting",
            "sombrio": "dark",
            "metálico": "steel",
            "fada": "fairy",
            "dragão": "dragon",
            "psíquico": "psychic",
        }

        for pt, en in type_mapping.items():
            if pt in message_lower or en in message_lower:
                filters["type_filter"] = en
                break

        if any(k in message_lower for k in ["rápid", "veloz", "speed"]):
            filters["strategy_filter"] = "speed"
        elif any(k in message_lower for k in ["tank", "defensiv", "resistent"]):
            filters["strategy_filter"] = "tank"
        elif any(k in message_lower for k in ["ataque", "atacante", "offensive", "ofensiv"]):
            filters["strategy_filter"] = "offensive"
        elif any(k in message_lower for k in ["balanceado", "equilibrado", "balanced"]):
            filters["strategy_filter"] = "balanced"

        return filters

    async def _generate_balanced_team(self, filters: dict = None) -> Optional[dict]:
        """Gera equipe balanceada"""
        global LAST_TEAM_IDS

        if filters is None:
            filters = {}

        type_filter = filters.get("type_filter")
        strategy_filter = filters.get("strategy_filter")

        try:
            team_list = []
            attempts = 0

            if type_filter:
                type_pokemon_ids = await pokeapi_service.get_pokemon_by_type(type_filter, limit=100)
                available_ids = [
                    pid for pid in type_pokemon_ids if pid not in LAST_TEAM_IDS
                ] or type_pokemon_ids
                selected_ids = random.sample(available_ids, min(6, len(available_ids)))
            else:
                main_types = ["fire", "water", "grass", "electric", "psychic", "dragon"]
                selected_ids = []
                for ptype in main_types:
                    type_ids = await pokeapi_service.get_pokemon_by_type(ptype, limit=50)
                    available = [pid for pid in type_ids if pid not in LAST_TEAM_IDS] or type_ids
                    if available:
                        selected_ids.append(random.choice(available))

            for pokemon_id in selected_ids:
                if attempts >= 50:
                    break
                try:
                    pokemon_data = await pokeapi_service.get_pokemon(pokemon_id)
                    if pokemon_data:
                        if strategy_filter and not self._matches_strategy(
                            pokemon_data, strategy_filter
                        ):
                            attempts += 1
                            continue
                        team_list.append(pokemon_data)
                except:
                    attempts += 1

            while len(team_list) < 6 and attempts < 50:
                try:
                    random_id = (
                        random.choice(type_pokemon_ids)
                        if type_filter and "type_pokemon_ids" in locals()
                        else random.randint(1, 1025)
                    )
                    if random_id not in LAST_TEAM_IDS and random_id not in [
                        p["id"] for p in team_list
                    ]:
                        pokemon_data = await pokeapi_service.get_pokemon(random_id)
                        if pokemon_data:
                            team_list.append(pokemon_data)
                except:
                    pass
                attempts += 1

            if len(team_list) >= 6:
                LAST_TEAM_IDS = [p["id"] for p in team_list]
                return {
                    "is_team": True,
                    "team_list": team_list,
                    "strategy": self._generate_team_strategy(
                        team_list, type_filter, strategy_filter
                    ),
                }
            return None

        except Exception as e:
            print(f"❌ [TEAM] Erro: {e}")
            return None

    def _matches_strategy(self, pokemon_data: dict, strategy: str) -> bool:
        """Verifica se Pokémon se encaixa na estratégia"""
        stats = pokemon_data["stats"]
        if strategy == "speed":
            return stats["speed"] >= 100
        elif strategy == "tank":
            return (stats["defense"] + stats["special-defense"]) >= 150
        elif strategy == "offensive":
            return stats["attack"] >= 100 or stats["special-attack"] >= 100
        elif strategy == "balanced":
            return all(stat >= 50 for stat in stats.values())
        return True

    def _generate_team_strategy(
        self, team_list: list, type_filter: str = None, strategy_filter: str = None
    ) -> dict:
        """Gera estratégia da equipe"""
        types_count = {}
        roles = []

        for pokemon in team_list:
            for ptype in pokemon["types"]:
                types_count[ptype] = types_count.get(ptype, 0) + 1

            stats = pokemon["stats"]
            if stats["speed"] >= 100:
                role = (
                    "Sweeper Rápido"
                    if stats["attack"] >= 100 or stats["special-attack"] >= 100
                    else "Suporte Veloz"
                )
            elif stats["attack"] >= 100 or stats["special-attack"] >= 100:
                role = "Atacante Pesado"
            elif stats["defense"] >= 100 or stats["special-defense"] >= 100:
                role = "Tank Defensivo"
            else:
                role = "Versátil"
            roles.append(f"{pokemon['name'].capitalize()}: {role}")

        if type_filter:
            title = f"Equipe {type_filter.capitalize()} Especializada"
            description = f"Equipe focada no tipo {type_filter}"
        elif strategy_filter == "speed":
            title = "Equipe Speed Blitz"
            description = "Time ultra-rápido"
        elif strategy_filter == "tank":
            title = "Equipe Fortaleza"
            description = "Time defensivo"
        elif strategy_filter == "offensive":
            title = "Equipe Agressiva"
            description = "Time ofensivo"
        else:
            title = "Equipe Balanceada"
            description = "Equipe versátil"

        avg_stats = {
            "hp": sum(p["stats"]["hp"] for p in team_list) // len(team_list),
            "attack": sum(p["stats"]["attack"] for p in team_list) // len(team_list),
            "defense": sum(p["stats"]["defense"] for p in team_list) // len(team_list),
            "speed": sum(p["stats"]["speed"] for p in team_list) // len(team_list),
        }

        strengths = []
        if len(set(types_count.keys())) >= 5:
            strengths.append("Excelente cobertura de tipos")
        if avg_stats["speed"] >= 90:
            strengths.append("Alta velocidade")
        if avg_stats["attack"] >= 85:
            strengths.append("Forte ataque")
        strengths.append(f"HP médio: {avg_stats['hp']}")

        return {
            "title": title,
            "description": description,
            "type_coverage": list(types_count.keys()),
            "roles": roles,
            "strengths": strengths or ["Time equilibrado"],
            "avg_stats": avg_stats,
        }

    def _build_context(self, history: list, pokemon_data: Optional[dict]) -> str:
        """Constrói contexto para LLM"""
        context_parts = []

        if pokemon_data:
            if pokemon_data.get("is_team"):
                team_list = pokemon_data["team_list"]
                strategy = pokemon_data.get("strategy", {})
                context_parts.append(f"Equipe: {strategy.get('title')}")
                context_parts.append(f"Descrição: {strategy.get('description')}")
                for i, p in enumerate(team_list, 1):
                    context_parts.append(f"{i}. {p['name'].upper()} ({', '.join(p['types'])})")
            elif pokemon_data.get("is_comparison"):
                for i, p in enumerate(pokemon_data["pokemon_list"], 1):
                    context_parts.append(
                        f"{i}. {p['name'].upper()}: Total {sum(p['stats'].values())}"
                    )
            else:
                context_parts.append(
                    f"{pokemon_data['name'].upper()}: {', '.join(pokemon_data['types'])}"
                )

        if history:
            context_parts.append("\nHistórico:")
            for msg in history[-3:]:
                context_parts.append(f"{msg['role']}: {msg['content'][:50]}")

        return "\n".join(context_parts)

    def _analyze_comparison(self, pokemon_list: list) -> str:
        """Analisa comparação"""
        if len(pokemon_list) < 2:
            return ""
        p1, p2 = pokemon_list[0], pokemon_list[1]
        total1, total2 = sum(p1["stats"].values()), sum(p2["stats"].values())
        winner = p1["name"].upper() if total1 > total2 else p2["name"].upper()
        return f"✅ {winner} é superior (Total: {max(total1, total2)})"

    async def get_chat_history_for_user(self, user_id: int, db: Session):
        """Retorna histórico completo"""
        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
        return [
            {
                "id": msg.id,
                "content": msg.content,
                "is_bot": msg.is_bot,
                "timestamp": msg.created_at.isoformat() + "Z",
            }
            for msg in messages
        ]

    async def clear_chat_history(self, user_id: int, db: Session) -> bool:
        """Limpa histórico"""
        try:
            db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
            db.commit()
            return True
        except:
            db.rollback()
            return False


chat_service = ChatService()
