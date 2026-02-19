"""add pokemon_data to chat_messages

Revision ID: 8c09c972aff4
Revises: 8074b00bd79d
Create Date: 2026-02-18 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


# revision identifiers, used by Alembic.
revision = '8c09c972aff4'
down_revision = '8074b00bd79d'
branch_labels = None
depends_on = None


def upgrade():
    """Adicionar coluna pokemon_data à tabela chat_messages"""
    op.add_column('chat_messages', sa.Column('pokemon_data', JSON, nullable=True))


def downgrade():
    """Remover coluna pokemon_data"""
    op.drop_column('chat_messages', 'pokemon_data')