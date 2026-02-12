from pydantic_settings import BaseSettings
from typing import List, Union
import json


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "Pokédex AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://pokedex_user:pokedex_pass@localhost:5432/pokedex_db"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    
    # PokéAPI
    POKEAPI_BASE_URL: str = "https://pokeapi.co/api/v2"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins(self) -> List[str]:
        """Retorna lista de origens permitidas para CORS."""
        return ["http://localhost:5173", "http://localhost:3000", "http://localhost"]


settings = Settings()