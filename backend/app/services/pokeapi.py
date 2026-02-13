import httpx
from typing import Optional, List, Dict
from app.core.config import settings


class PokeAPIService:
    """Serviço para interagir com a PokéAPI."""

    def __init__(self):
        self.base_url = settings.POKEAPI_BASE_URL
        self.timeout = 10.0

    async def get_pokemon(self, identifier: str | int) -> Optional[Dict]:
        """
        Busca dados de um Pokémon por nome ou ID.

        Args:
            identifier: Nome ou ID do Pokémon

        Returns:
            Dicionário com dados FORMATADOS do Pokémon ou None se não encontrado
        """
        try:
            print(f"🔍 [POKEAPI] Buscando Pokémon: {identifier}")

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/pokemon/{str(identifier).lower()}")
                response.raise_for_status()
                data = response.json()

                # Formatar dados para o formato esperado pelo chat_service
                pokemon_data = {
                    "id": data["id"],
                    "name": data["name"],
                    "sprites": {"front_default": data["sprites"]["front_default"]},
                    "types": [t["type"]["name"] for t in data["types"]],
                    "stats": {
                        "hp": data["stats"][0]["base_stat"],
                        "attack": data["stats"][1]["base_stat"],
                        "defense": data["stats"][2]["base_stat"],
                        "special-attack": data["stats"][3]["base_stat"],
                        "special-defense": data["stats"][4]["base_stat"],
                        "speed": data["stats"][5]["base_stat"],
                    },
                }

                print(f"✅ [POKEAPI] Pokémon encontrado: {pokemon_data['name']}")
                return pokemon_data

        except httpx.HTTPStatusError as e:
            print(
                f"❌ [POKEAPI] Pokémon não encontrado (HTTP {e.response.status_code}): {identifier}"
            )
            return None
        except Exception as e:
            print(f"❌ [POKEAPI] Erro ao buscar Pokémon {identifier}: {type(e).__name__} - {e}")
            return None

    async def get_all_pokemon_names(self) -> list:
        """
        Busca TODOS os nomes de Pokémon da API (cache)

        Returns:
            Lista com todos os nomes de Pokémon
        """
        try:
            print(f"🔍 [POKEAPI] Buscando lista completa de Pokémon...")

            async with httpx.AsyncClient(timeout=30.0) as client:
                # Buscar contagem total primeiro
                response = await client.get(f"{self.base_url}/pokemon?limit=1")
                response.raise_for_status()
                data = response.json()
                total_count = data["count"]

                print(f"📊 [POKEAPI] Total de Pokémon disponíveis: {total_count}")

                # Buscar todos de uma vez
                response = await client.get(f"{self.base_url}/pokemon?limit={total_count}")
                response.raise_for_status()
                data = response.json()

                # Extrair apenas os nomes
                pokemon_names = [p["name"] for p in data["results"]]

                print(f"✅ [POKEAPI] {len(pokemon_names)} nomes de Pokémon carregados")
                return pokemon_names

        except Exception as e:
            print(f"❌ [POKEAPI] Erro ao buscar lista completa: {e}")
            return []

    async def get_random_pokemon_ids(self, count: int = 6, max_id: int = 1025) -> list:
        """
        Retorna IDs aleatórios de Pokémon

        Args:
            count: Quantidade de IDs para retornar
            max_id: ID máximo (1025 = todos até Gen 9)

        Returns:
            Lista de IDs aleatórios
        """
        import random

        return random.sample(range(1, max_id + 1), count)

    async def get_pokemon_by_type(self, type_name: str, limit: int = 20) -> list:
        """
        Busca Pokémon de um tipo específico (otimizado)

        Args:
            type_name: Nome do tipo (fire, water, ghost, etc)
            limit: Máximo de resultados

        Returns:
            Lista de IDs de Pokémon desse tipo
        """
        try:
            print(f"🔍 [POKEAPI] Buscando Pokémon do tipo: {type_name}")
            type_data = await self.get_type(type_name)
            if type_data and "pokemon" in type_data:
                # Extrair apenas os IDs
                pokemon_ids = []
                for p in type_data["pokemon"][:limit]:
                    # Extrair ID da URL
                    url = p["pokemon"]["url"]
                    pokemon_id = int(url.rstrip("/").split("/")[-1])
                    pokemon_ids.append(pokemon_id)
                print(f"✅ [POKEAPI] Encontrados {len(pokemon_ids)} Pokémon do tipo {type_name}")
                return pokemon_ids
            return []
        except Exception as e:
            print(f"❌ [POKEAPI] Erro ao buscar tipo {type_name}: {e}")
            return []

    async def get_pokemon_species(self, identifier: str | int) -> Optional[Dict]:
        """
        Busca dados da espécie de um Pokémon.

        Args:
            identifier: Nome ou ID do Pokémon

        Returns:
            Dicionário com dados da espécie ou None se não encontrado
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/pokemon-species/{identifier}")
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"❌ [POKEAPI] Erro ao buscar espécie do Pokémon {identifier}: {e}")
            return None

    async def get_pokemon_list(self, limit: int = 20, offset: int = 0) -> Optional[Dict]:
        """
        Lista Pokémon com paginação.

        Args:
            limit: Número de resultados por página
            offset: Deslocamento para paginação

        Returns:
            Dicionário com lista de Pokémon
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/pokemon", params={"limit": limit, "offset": offset}
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"❌ [POKEAPI] Erro ao listar Pokémon: {e}")
            return None

    async def get_type(self, type_name: str) -> Optional[Dict]:
        """
        Busca informações sobre um tipo de Pokémon.

        Args:
            type_name: Nome do tipo (ex: 'fire', 'water')

        Returns:
            Dicionário com informações do tipo
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/type/{type_name}")
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"❌ [POKEAPI] Erro ao buscar tipo {type_name}: {e}")
            return None

    async def get_evolution_chain(self, pokemon_id: int) -> Optional[Dict]:
        """
        Busca a cadeia de evolução de um Pokémon.

        Args:
            pokemon_id: ID do Pokémon

        Returns:
            Dicionário com a cadeia de evolução
        """
        # Primeiro busca a espécie para obter a URL da cadeia de evolução
        species = await self.get_pokemon_species(pokemon_id)
        if not species or "evolution_chain" not in species:
            return None

        evolution_url = species["evolution_chain"]["url"]

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(evolution_url)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"❌ [POKEAPI] Erro ao buscar cadeia de evolução: {e}")
            return None


# Instância global do serviço
pokeapi_service = PokeAPIService()
