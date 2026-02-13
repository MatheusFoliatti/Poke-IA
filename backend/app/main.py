from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.endpoints import auth, chat
from app.services.chat_service import load_pokemon_names_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 [STARTUP] Iniciando aplicação...")
    print("🔄 [STARTUP] Carregando cache de Pokémon...")
    await load_pokemon_names_cache()
    print("✅ [STARTUP] Cache carregado com sucesso!")
    yield
    # Shutdown
    print("👋 [SHUTDOWN] Encerrando aplicação...")


app = FastAPI(
    title="Pokédex AI API",
    description="API para o assistente de Pokémon com IA",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS - IMPORTANTE: Deve estar ANTES das rotas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/")
async def root():
    return {
        "message": "Pokédex AI API v2.0",
        "status": "online",
        "features": [
            "Busca de Pokémon com correção automática (Fuzzy Matching)",
            "Comparação de Pokémon",
            "Geração de equipes balanceadas",
            "Cache de 1025+ nomes de Pokémon",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
