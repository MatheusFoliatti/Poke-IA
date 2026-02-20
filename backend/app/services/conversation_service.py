"""
Service Layer para Conversas
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Conversation, ChatMessage
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
)
from typing import Optional
from datetime import datetime


class ConversationService:

    @staticmethod
    def get_user_conversations(db: Session, user_id: int) -> list:
        """Obtém todas as conversas de um usuário com message_count real via query"""
        rows = (
            db.query(Conversation, func.count(ChatMessage.id).label("message_count"))
            .outerjoin(ChatMessage, Conversation.id == ChatMessage.conversation_id)
            .filter(Conversation.user_id == user_id)
            .group_by(Conversation.id)
            .order_by(Conversation.updated_at.desc())
            .all()
        )

        # Retorna dicts compatíveis com ConversationResponse em vez de tentar
        # atribuir a uma @property do modelo SQLAlchemy (causava AttributeError → 500)
        result = []
        for conversation, message_count in rows:
            result.append(
                ConversationResponse(
                    id=conversation.id,
                    user_id=conversation.user_id,
                    title=conversation.title,
                    created_at=conversation.created_at,
                    updated_at=conversation.updated_at,
                    message_count=message_count,
                )
            )

        return result

    @staticmethod
    def get_conversation_by_id(
        db: Session, conversation_id: int, user_id: int
    ) -> Optional[Conversation]:
        return (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
            .first()
        )

    @staticmethod
    def create_conversation(
        db: Session, user_id: int, conversation: ConversationCreate
    ) -> Conversation:
        db_conversation = Conversation(
            user_id=user_id,
            title=conversation.title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)

        print(
            f"✅ [CONVERSATION] Criada: '{db_conversation.title}' (ID: {db_conversation.id})"
        )

        return db_conversation

    @staticmethod
    def update_conversation(
        db: Session, conversation_id: int, user_id: int, update_data: ConversationUpdate
    ) -> Optional[Conversation]:
        conversation = ConversationService.get_conversation_by_id(
            db, conversation_id, user_id
        )

        if not conversation:
            return None

        conversation.title = update_data.title
        conversation.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(conversation)

        print(
            f"✅ [CONVERSATION] Renomeada ID {conversation_id}: '{conversation.title}'"
        )

        return conversation

    @staticmethod
    def delete_conversation(db: Session, conversation_id: int, user_id: int) -> bool:
        conversation = ConversationService.get_conversation_by_id(
            db, conversation_id, user_id
        )

        if not conversation:
            return False

        db.delete(conversation)
        db.commit()

        print(f"✅ [CONVERSATION] Deletada ID {conversation_id}")

        return True

    @staticmethod
    def get_or_create_default_conversation(db: Session, user_id: int) -> Conversation:
        """Retorna a conversa mais recente ou cria uma nova"""
        conversation = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .first()
        )

        if not conversation:
            conversation = Conversation(
                user_id=user_id,
                title="Conversa Principal",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            print(f"✅ [CONVERSATION] Conversa padrão criada (ID: {conversation.id})")

        return conversation


conversation_service = ConversationService()
