"""
Modelos do banco de dados
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class User(Base):
    """
    Modelo de Usuário
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    conversations = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )
    messages = relationship("ChatMessage", back_populates="user")


class Conversation(Base):
    """
    Modelo de Conversa
    """

    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(255), nullable=False, default="Nova Conversa")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relacionamentos
    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "ChatMessage", back_populates="conversation", cascade="all, delete-orphan"
    )

    @property
    def message_count(self):
        """Retorna o número de mensagens na conversa"""
        return len(self.messages)


class ChatMessage(Base):
    """
    Modelo de Mensagem de Chat
    """

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_bot = Column(Boolean, default=False, nullable=False)
    pokemon_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relacionamentos
    user = relationship("User", back_populates="messages")
    conversation = relationship("Conversation", back_populates="messages")
