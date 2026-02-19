"""add email back to users

Revision ID: 8074b00bd79d
Revises: 661204f8282a
Create Date: 2026-02-18 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8074b00bd79d'
down_revision = '661204f8282a'
branch_labels = None
depends_on = None


def upgrade():
    """Adicionar coluna email de volta à tabela users"""
    # Adicionar coluna email (nullable)
    op.add_column('users', sa.Column('email', sa.String(length=255), nullable=True))
    
    # Criar índice único
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)


def downgrade():
    """Remover coluna email"""
    # Remover índice
    op.drop_index(op.f('ix_users_email'), table_name='users')
    
    # Remover coluna
    op.drop_column('users', 'email')