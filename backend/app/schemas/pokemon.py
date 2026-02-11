from pydantic import BaseModel
from typing import List, Dict, Optional, Any


class PokemonType(BaseModel):
    """Schema para tipo do Pokémon"""
    name: str
    url: str


class PokemonAbility(BaseModel):
    """Schema para habilidade do Pokémon"""
    name: str
    url: str
    is_hidden: bool = False


class PokemonStat(BaseModel):
    """Schema para estatística do Pokémon"""
    name: str
    base_stat: int
    effort: int


class PokemonSprite(BaseModel):
    """Schema para sprites do Pokémon"""
    front_default: Optional[str] = None
    front_shiny: Optional[str] = None
    back_default: Optional[str] = None
    back_shiny: Optional[str] = None


class Pokemon(BaseModel):
    """Schema principal do Pokémon"""
    id: int
    name: str
    height: int
    weight: int
    base_experience: int
    types: List[str]
    abilities: List[str]
    stats: Dict[str, int]  # {"hp": 45, "attack": 49, ...}
    sprites: Dict[str, Optional[str]]  # URLs das imagens
    species_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class PokemonDetail(BaseModel):
    """Schema detalhado do Pokémon com informações extras"""
    id: int
    name: str
    height: int
    weight: int
    base_experience: int
    types: List[Dict[str, Any]]
    abilities: List[Dict[str, Any]]
    stats: List[Dict[str, Any]]
    sprites: Dict[str, Any]
    moves: List[str] = []
    species: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class PokemonList(BaseModel):
    """Schema para lista de Pokémon"""
    count: int
    results: List[Dict[str, str]]
    next: Optional[str] = None
    previous: Optional[str] = None


class PokemonSearchResponse(BaseModel):
    """Schema para resposta de busca de Pokémon"""
    pokemon: Pokemon
    timestamp: str


class TeamSuggestionRequest(BaseModel):
    """Schema para requisição de sugestão de time"""
    favorite_types: Optional[List[str]] = []
    generation: Optional[int] = None
    playstyle: Optional[str] = "balanced"


class TeamSuggestionResponse(BaseModel):
    """Schema para resposta de sugestão de time"""
    suggestion: str
    timestamp: str