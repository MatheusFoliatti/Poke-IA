from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.db.models import User
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)
from app.core.config import settings

router = APIRouter()


# Schema para registro
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


@router.post("/register")
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    print(f"📝 [AUTH] Tentativa de registro: {request.username} ({request.email})")

    # Verificar se username ou email já existem
    existing_user = (
        db.query(User)
        .filter((User.username == request.username) | (User.email == request.email))
        .first()
    )

    if existing_user:
        if existing_user.username == request.username:
            print(f"❌ [AUTH] Username já existe: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário já existe"
            )
        else:
            print(f"❌ [AUTH] Email já cadastrado: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado"
            )

    hashed_password = get_password_hash(request.password)
    new_user = User(
        username=request.username, email=request.email, hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(
        f"✅ [AUTH] Usuário criado: {request.username} (ID: {new_user.id}, Email: {request.email})"
    )

    return {
        "message": "Usuário criado com sucesso",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
        },
    }


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Login do usuário"""
    print(f"📝 [AUTH] Tentativa de login: {form_data.username}")

    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        print(f"❌ [AUTH] Usuário não encontrado: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
        )

    if not verify_password(form_data.password, user.hashed_password):
        print(f"❌ [AUTH] Senha incorreta para: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha incorretos",
        )

    # Criar token com username
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    print(f"✅ [AUTH] Login bem-sucedido: {user.username} (ID: {user.id})")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email},
    }


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Renova o token JWT do usuário"""
    print(f"🔄 [AUTH] Renovando token para: {current_user.username}")

    # Criar novo token com username
    access_token = create_access_token(data={"sub": current_user.username})

    print(f"✅ [AUTH] Token renovado para: {current_user.username}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email if hasattr(current_user, "email") else None,
        },
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário atual"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email if hasattr(current_user, "email") else None,
    }
