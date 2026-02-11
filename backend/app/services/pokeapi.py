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
            Dicionário com dados do Pokémon ou None se não encontrado
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/pokemon/{identifier}")
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            print(f"Erro ao buscar Pokémon {identifier}: {e}")
            return None
    
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
            print(f"Erro ao buscar espécie do Pokémon {identifier}: {e}")
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
            print(f"Erro ao listar Pokémon: {e}")
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
            print(f"Erro ao buscar tipo {type_name}: {e}")
            return None
    
    async def get_pokemon_by_type(self, type_name: str) -> Optional[List[Dict]]:
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
            print(f"Erro ao buscar cadeia de evolução: {e}")
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