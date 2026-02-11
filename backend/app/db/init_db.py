from app.db.database import engine
from app.db.models import Base


def init_db():
    """Cria todas as tabelas no banco de dados"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas com sucesso!")


if __name__ == "__main__":
    init_db()