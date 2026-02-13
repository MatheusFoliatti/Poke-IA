# backend/app/db/models.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class User(Base):
    """Modelo de usuário."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    chat_messages = relationship(  # ← ALTERADO
        "ChatMessage",  # ← ALTERADO
        back_populates="user",
        cascade="all, delete-orphan"
    )
    favorite_pokemon = relationship(
        "FavoritePokemon",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    search_history = relationship(
        "SearchHistory",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class ChatMessage(Base):  # ← ALTERADO de Conversation para ChatMessage
    """Modelo de mensagem do chat."""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)  # ← Mantido
    is_bot = Column(Boolean, default=False)  # ← ADICIONADO
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento
    user = relationship("User", back_populates="chat_messages")  # ← ALTERADO


class FavoritePokemon(Base):
    """Modelo de Pokémon favoritos do usuário."""
    __tablename__ = "favorite_pokemon"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pokemon_id = Column(Integer, nullable=False)
    pokemon_name = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento
    user = relationship("User", back_populates="favorite_pokemon")


class SearchHistory(Base):
    """Modelo de histórico de buscas de Pokémon."""
    __tablename__ = "pokemon_searches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pokemon_name = Column(String, nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento
    user = relationship("User", back_populates="search_history")