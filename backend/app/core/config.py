from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "Pokédex AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    
    # PokeAPI
    POKEAPI_BASE_URL: str = "https://pokeapi.co/api/v2"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()