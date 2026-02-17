"""baseline

Revision ID: abc123def456  # ← ID gerado automaticamente
Revises: 
Create Date: 2024-XX-XX XX:XX:XX

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abc123def456'  # ← MESMO ID de cima
down_revision = None        # ← IMPORTANTE: None
branch_labels = None
depends_on = None


def upgrade():
    """Tabelas users e chat_messages já existem no banco"""
    pass


def downgrade():
    """Não fazer nada"""
    pass