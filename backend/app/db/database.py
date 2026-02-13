# backend/app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Cria engine do banco de dados
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Cria sessão local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()


# Dependency para obter sessão do banco
def get_db():
    """
    Dependency que fornece uma sessão do banco de dados.
    A sessão é fechada automaticamente após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()