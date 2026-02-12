from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.database import get_db
from app.db.models import User
from app.schemas.user import UserCreate, UserLogin, Token, User as UserSchema
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário.
    
    Args:
        user_data: Dados do novo usuário
        db: Sessão do banco de dados
    
    Returns:
        Usuário criado
    
    Raises:
        HTTPException: Se username ou email já existem
    """
    # Verifica se username já existe
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username já está em uso"
        )
    
    # Verifica se email já existe
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está em uso"
        )
    
    # Cria novo usuário
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Autentica usuário e retorna token JWT."""
    
    print(f"🔐 [LOGIN] Tentativa de login: {credentials.username}")
    print(f"🔐 [LOGIN] Dados recebidos: {credentials}")
    
    # Busca usuário
    user = db.query(User).filter(User.username == credentials.username).first()
    print(f"🔍 [LOGIN] Usuário encontrado: {user.username if user else 'None'}")
    
    # Verifica se usuário existe e senha está correta
    if not user or not verify_password(credentials.password, user.hashed_password):
        print(f"❌ [LOGIN] Falha na autenticação")
        print(f"   - Usuário existe: {user is not None}")
        if user:
            print(f"   - Senha correta: {verify_password(credentials.password, user.hashed_password)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verifica se usuário está ativo
    if not user.is_active:
        print(f"❌ [LOGIN] Usuário inativo")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    print(f"✅ [LOGIN] Login bem-sucedido para: {user.username}")
    
    # Cria token de acesso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},  # ✅ CORRIGIDO: Converte ID para string
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Retorna informações do usuário autenticado.
    
    Args:
        current_user: Usuário autenticado (via dependency)
    
    Returns:
        Dados do usuário
    """
    return current_user