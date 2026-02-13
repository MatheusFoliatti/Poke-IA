from pydantic import BaseModel
from typing import Optional, Dict, Any


class ChatRequest(BaseModel):
    """Schema para requisição de chat."""
    message: str


class ChatResponse(BaseModel):
    """Schema para resposta de chat."""
    user_message: str
    bot_response: str
    pokemon_data: Optional[Dict[str, Any]] = None
    timestamp: str