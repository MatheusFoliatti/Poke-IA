from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    """Modelo de usuário"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento com mensagens
    messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"


class ChatMessage(Base):
    """Modelo de mensagem do chat"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_bot = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamento com usuário
    user = relationship("User", back_populates="messages")
    
    def __repr__(self):
        role = "Bot" if self.is_bot else "User"
        return f"<ChatMessage(id={self.id}, {role}, user_id={self.user_id})>"


class PokemonSearch(Base):
    """Modelo para histórico de buscas de Pokémon"""
    __tablename__ = "pokemon_searches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pokemon_name = Column(String(100), nullable=False)
    pokemon_id = Column(Integer, nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<PokemonSearch(id={self.id}, pokemon='{self.pokemon_name}')>"