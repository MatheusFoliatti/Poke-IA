"""
Service Layer para Conversas

Contém lógica de negócio para operações de conversas.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Conversation, ChatMessage
from app.schemas.conversation import ConversationCreate, ConversationUpdate
from typing import Optional
from datetime import datetime


class ConversationService:
    """Serviço para gerenciar conversas"""

    @staticmethod
    def get_user_conversations(db: Session, user_id: int) -> list[Conversation]:
        """
        Obtém todas as conversas de um usuário
        
        Args:
            db: Sessão do banco de dados
            user_id: ID do usuário
            
        Returns:
            Lista de conversas ordenadas por updated_at (mais recente primeiro)
        """
        conversations = (
            db.query(
                Conversation,
                func.count(ChatMessage.id).label('message_count')
            )
            .outerjoin(ChatMessage, Conversation.id == ChatMessage.conversation_id)
            .filter(Conversation.user_id == user_id)
            .group_by(Conversation.id)
            .order_by(Conversation.updated_at.desc())
            .all()
        )
        
        # Adicionar message_count a cada conversa
        result = []
        for conversation, message_count in conversations:
            conversation.message_count = message_count
            result.append(conversation)
        
        return result

    @staticmethod
    def get_conversation_by_id(
        db: Session, 
        conversation_id: int, 
        user_id: int
    ) -> Optional[Conversation]:
        """
        Obtém conversa específica (verifica se pertence ao usuário)
        
        Args:
            db: Sessão do banco
            conversation_id: ID da conversa
            user_id: ID do usuário (para validação)
            
        Returns:
            Conversation ou None se não encontrada/não pertencer ao usuário
        """
        return (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def create_conversation(
        db: Session, 
        user_id: int, 
        conversation: ConversationCreate
    ) -> Conversation:
        """
        Cria nova conversa para o usuário
        
        Args:
            db: Sessão do banco
            user_id: ID do usuário
            conversation: Dados da conversa
            
        Returns:
            Conversation criada
        """
        db_conversation = Conversation(
            user_id=user_id,
            title=conversation.title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        
        print(f"✅ [CONVERSATION] Criada: '{db_conversation.title}' (ID: {db_conversation.id})")
        
        return db_conversation

    @staticmethod
    def update_conversation(
        db: Session,
        conversation_id: int,
        user_id: int,
        update_data: ConversationUpdate
    ) -> Optional[Conversation]:
        """
        Atualiza título da conversa
        
        Args:
            db: Sessão do banco
            conversation_id: ID da conversa
            user_id: ID do usuário (validação)
            update_data: Novos dados
            
        Returns:
            Conversation atualizada ou None
        """
        conversation = ConversationService.get_conversation_by_id(
            db, conversation_id, user_id
        )
        
        if not conversation:
            return None
        
        conversation.title = update_data.title
        conversation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(conversation)
        
        print(f"✅ [CONVERSATION] Atualizada: '{conversation.title}' (ID: {conversation.id})")
        
        return conversation

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: int,
        user_id: int
    ) -> bool:
        """
        Deleta conversa (e todas as mensagens via CASCADE)
        
        Args:
            db: Sessão do banco
            conversation_id: ID da conversa
            user_id: ID do usuário (validação)
            
        Returns:
            True se deletado, False se não encontrado
        """
        conversation = ConversationService.get_conversation_by_id(
            db, conversation_id, user_id
        )
        
        if not conversation:
            return False
        
        print(f"🗑️ [CONVERSATION] Deletando: '{conversation.title}' (ID: {conversation.id})")
        
        db.delete(conversation)
        db.commit()
        
        return True

    @staticmethod
    def get_or_create_default_conversation(
        db: Session, 
        user_id: int
    ) -> Conversation:
        """
        Obtém conversa padrão do usuário ou cria uma se não existir
        
        Args:
            db: Sessão do banco
            user_id: ID do usuário
            
        Returns:
            Conversation padrão
        """
        # Buscar primeira conversa do usuário
        conversation = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.asc())
            .first()
        )
        
        # Se não existe, criar
        if not conversation:
            conversation = ConversationService.create_conversation(
                db,
                user_id,
                ConversationCreate(title="Conversa Principal")
            )
        
        return conversation


# Instância singleton
conversation_service = ConversationService()