from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.schemas.pokemon import Pokemon, PokemonList
from app.services.pokeapi import pokeapi_service
from app.api.deps import get_current_user
from app.db.models import User

router = APIRouter(prefix="/pokemon", tags=["Pokemon"])


@router.get("/{identifier}", response_model=dict)
async def get_pokemon(
    identifier: str,
    current_user: User = Depends(get_current_user)
):
    """
    Busca informações detalhadas de um Pokémon por nome ou ID.
    
    Args:
        identifier: Nome ou ID do Pokémon
        current_user: Usuário autenticado
    
    Returns:
        Dados completos do Pokémon
    
    Raises:
        HTTPException: Se Pokémon não encontrado
    """
    pokemon = await pokeapi_service.get_detailed_pokemon_info(identifier)
    
    if not pokemon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pokémon '{identifier}' não encontrado"
        )
    
    return pokemon


@router.get("/", response_model=dict)
async def list_pokemon(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """
    Lista Pokémon com paginação.
    
    Args:
        limit: Número de resultados por página (1-100)
        offset: Deslocamento para paginação
        current_user: Usuário autenticado
    
    Returns:
        Lista paginada de Pokémon
    """
    pokemon_list = await pokeapi_service.get_pokemon_list(limit, offset)
    
    if not pokemon_list:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar lista de Pokémon"
        )
    
    return pokemon_list


@router.get("/type/{type_name}", response_model=list)
async def get_pokemon_by_type(
    type_name: str,
    current_user: User = Depends(get_current_user)
):
    """
    Busca todos os Pokémon de um tipo específico.
    
    Args:
        type_name: Nome do tipo (ex: fire, water, grass)
        current_user: Usuário autenticado
    
    Returns:
        Lista de Pokémon do tipo especificado
    
    Raises:
        HTTPException: Se tipo não encontrado
    """
    pokemon_list = await pokeapi_service.get_pokemon_by_type(type_name.lower())
    
    if pokemon_list is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tipo '{type_name}' não encontrado"
        )
    
    return pokemon_list


@router.get("/search/{query}", response_model=list)
async def search_pokemon(
    query: str,
    current_user: User = Depends(get_current_user)
):
    """
    Busca Pokémon por nome (busca parcial).
    
    Args:
        query: Termo de busca
        current_user: Usuário autenticado
    
    Returns:
        Lista de Pokémon que correspondem à busca
    """
    results = await pokeapi_service.search_pokemon(query)
    return results


@router.get("/evolution/{pokemon_id}", response_model=dict)
async def get_evolution_chain(
    pokemon_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Busca a cadeia de evolução de um Pokémon.
    
    Args:
        pokemon_id: ID do Pokémon
        current_user: Usuário autenticado
    
    Returns:
        Cadeia de evolução
    
    Raises:
        HTTPException: Se evolução não encontrada
    """
    evolution = await pokeapi_service.get_evolution_chain(pokemon_id)
    
    if not evolution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cadeia de evolução não encontrada para Pokémon ID {pokemon_id}"
        )
    
    return evolution