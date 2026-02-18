"""add conversations table and update chat_messages

Revision ID: 5c40fd2edc57
Revises: 0eecc261f479
Create Date: 2026-02-17 15:43:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5c40fd2edc57'
down_revision = '0eecc261f479'
branch_labels = None
depends_on = None


def upgrade():
    # Criar tabela conversations
    op.create_table('conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)

    # Adicionar conversation_id em chat_messages (nullable temporariamente)
    op.add_column('chat_messages', sa.Column('conversation_id', sa.Integer(), nullable=True))
    
    # Migrar dados: criar conversa padrão para cada usuário com mensagens
    op.execute("""
        INSERT INTO conversations (user_id, title, created_at, updated_at)
        SELECT DISTINCT user_id, 'Conversa Principal', 
               COALESCE(MIN(created_at), NOW()), 
               COALESCE(MAX(created_at), NOW())
        FROM chat_messages
        GROUP BY user_id
    """)
    
    # Atualizar conversation_id nas mensagens existentes
    op.execute("""
        UPDATE chat_messages
        SET conversation_id = (
            SELECT id FROM conversations 
            WHERE conversations.user_id = chat_messages.user_id 
            LIMIT 1
        )
    """)
    
    # Tornar conversation_id NOT NULL
    op.alter_column('chat_messages', 'conversation_id', nullable=False)
    
    # Adicionar FK e índice
    op.create_foreign_key(
        'fk_chat_messages_conversation_id',
        'chat_messages', 'conversations',
        ['conversation_id'], ['id'],
        ondelete='CASCADE'
    )
    op.create_index(op.f('ix_chat_messages_conversation_id'), 'chat_messages', ['conversation_id'], unique=False)


def downgrade():
    # Remover índice e FK
    op.drop_index(op.f('ix_chat_messages_conversation_id'), table_name='chat_messages')
    op.drop_constraint('fk_chat_messages_conversation_id', 'chat_messages', type_='foreignkey')
    
    # Remover coluna
    op.drop_column('chat_messages', 'conversation_id')
    
    # Remover tabela conversations
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
