from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.database import get_db
from app.db.models import User
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()


@router.post("/register")
async def register(username: str, password: str, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    print(f"📝 [AUTH] Tentativa de registro: {username}")

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        print(f"❌ [AUTH] Usuário já existe: {username}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário já existe"
        )

    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print(f"✅ [AUTH] Usuário criado: {username} (ID: {new_user.id})")

    return {
        "message": "Usuário criado com sucesso",
        "user": {"id": new_user.id, "username": new_user.username},
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

    # 🔥 CORREÇÃO AQUI — usar ID no sub
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    print(f"✅ [AUTH] Login bem-sucedido: {user.username} (ID: {user.id})")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username},
    }


@router.post("/refresh")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Renova o token JWT do usuário"""
    print(f"🔄 [AUTH] Renovando token para: {current_user.username}")

    # Criar novo token
    access_token = create_access_token(data={"sub": current_user.username})

    print(f"✅ [AUTH] Token renovado para: {current_user.username}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"id": current_user.id, "username": current_user.username},
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário atual"""
    return {"id": current_user.id, "username": current_user.username}
