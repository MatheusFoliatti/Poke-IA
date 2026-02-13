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
                    "sprites": {
                        "front_default": data["sprites"]["front_default"]
                    },
                    "types": [t["type"]["name"] for t in data["types"]],
                    "stats": {
                        "hp": data["stats"][0]["base_stat"],
                        "attack": data["stats"][1]["base_stat"],
                        "defense": data["stats"][2]["base_stat"],
                        "special-attack": data["stats"][3]["base_stat"],
                        "special-defense": data["stats"][4]["base_stat"],
                        "speed": data["stats"][5]["base_stat"]
                    }
                }
                
                print(f"✅ [POKEAPI] Pokémon encontrado: {pokemon_data['name']}")
                return pokemon_data
                
        except httpx.HTTPStatusError as e:
            print(f"❌ [POKEAPI] Pokémon não encontrado (HTTP {e.response.status_code}): {identifier}")
            return None
        except Exception as e:
            print(f"❌ [POKEAPI] Erro ao buscar Pokémon {identifier}: {type(e).__name__} - {e}")
            return None
    
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
            if type_data and 'pokemon' in type_data:
                # Extrair apenas os IDs
                pokemon_ids = []
                for p in type_data['pokemon'][:limit]:
                    # Extrair ID da URL
                    url = p['pokemon']['url']
                    pokemon_id = int(url.rstrip('/').split('/')[-1])
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
                    f"{self.base_url}/pokemon",
                    params={"limit": limit, "offset": offset}
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
    
    async def get_pokemon_by_type_full(self, type_name: str) -> Optional[List[Dict]]:
        """
        Busca todos os Pokémon de um tipo específico.
        
        Args:
            type_name: Nome do tipo
        
        Returns:
            Lista de Pokémon do tipo especificado
        """
        type_data = await self.get_type(type_name)
        if type_data and 'pokemon' in type_data:
            return [p['pokemon'] for p in type_data['pokemon']]
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
        if not species or 'evolution_chain' not in species:
            return None
        
        evolution_url = species['evolution_chain']['url']
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(evolution_url)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"❌ [POKEAPI] Erro ao buscar cadeia de evolução: {e}")
            return None
    
    async def search_pokemon(self, query: str) -> List[Dict]:
        """
        Busca Pokémon por nome (busca parcial).
        
        Args:
            query: Termo de busca
        
        Returns:
            Lista de Pokémon que correspondem à busca
        """
        # PokéAPI não tem busca direta, então pegamos uma lista e filtramos
        all_pokemon = await self.get_pokemon_list(limit=1000)
        
        if not all_pokemon or 'results' not in all_pokemon:
            return []
        
        query_lower = query.lower()
        return [
            pokemon for pokemon in all_pokemon['results']
            if query_lower in pokemon['name'].lower()
        ]
    
    async def get_detailed_pokemon_info(self, identifier: str | int) -> Optional[Dict]:
        """
        Busca informações detalhadas combinando dados do Pokémon e da espécie.
        
        Args:
            identifier: Nome ou ID do Pokémon
        
        Returns:
            Dicionário com informações completas
        """
        pokemon = await self.get_pokemon(identifier)
        if not pokemon:
            return None
        
        species = await self.get_pokemon_species(pokemon['id'])
        
        # Combina os dados
        detailed_info = pokemon.copy()
        if species:
            detailed_info['species_info'] = {
                'generation': species.get('generation', {}),
                'is_legendary': species.get('is_legendary', False),
                'is_mythical': species.get('is_mythical', False),
                'habitat': species.get('habitat', {}),
                'flavor_text': self._get_english_flavor_text(species)
            }
        
        return detailed_info
    
    def _get_english_flavor_text(self, species: Dict) -> Optional[str]:
        """Extrai o texto de descrição em inglês."""
        if 'flavor_text_entries' not in species:
            return None
        
        for entry in species['flavor_text_entries']:
            if entry.get('language', {}).get('name') == 'en':
                return entry.get('flavor_text', '').replace('\n', ' ').replace('\f', ' ')
        
        return None


# Instância global do serviço
pokeapi_service = PokeAPIService()