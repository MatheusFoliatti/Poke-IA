"""remove email and is_active from users

Revision ID: 661204f8282a
Revises: 5c40fd2edc57
Create Date: 2026-02-17 16:07:19.327767

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '661204f8282a'
down_revision: Union[str, None] = '5c40fd2edc57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove colunas email e is_active da tabela users"""
    # Remover índice primeiro
    op.drop_index('ix_users_email', table_name='users')
    
    # Remover colunas
    op.drop_column('users', 'email')
    op.drop_column('users', 'is_active')


def downgrade() -> None:
    """Recriar colunas se necessário fazer rollback"""
    # Recriar colunas
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=True))
    op.add_column('users', sa.Column('email', sa.String(length=255), nullable=True))
    
    # Recriar índice
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
