from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Obtém usuário atual através do token JWT.
    
    Args:
        token: Token JWT
        db: Sessão do banco de dados
    
    Returns:
        Usuário autenticado
    
    Raises:
        HTTPException: Se token inválido ou usuário não encontrado
    """
    
    print(f"🔍 [DEBUG] Token recebido: {token[:50]}..." if token else "❌ [DEBUG] Nenhum token recebido!")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verifica se token foi fornecido
    if not token:
        print("❌ [DEBUG] Token não fornecido")
        raise credentials_exception
    
    # Decodifica o token
    payload = decode_access_token(token)
    print(f"🔓 [DEBUG] Payload decodificado: {payload}")
    
    if payload is None:
        print("❌ [DEBUG] Falha ao decodificar token")
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    print(f"👤 [DEBUG] User ID do payload: {user_id}")
    
    if user_id is None:
        print("❌ [DEBUG] sub não encontrado no payload")
        raise credentials_exception
    
    # Busca o usuário no banco
    user = db.query(User).filter(User.id == user_id).first()
    print(f"✅ [DEBUG] Usuário encontrado: {user.username if user else 'None'}")
    
    if user is None:
        print("❌ [DEBUG] Usuário não encontrado no banco")
        raise credentials_exception
    
    if not user.is_active:
        print("❌ [DEBUG] Usuário inativo")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    print(f"✅ [DEBUG] Autenticação bem-sucedida para: {user.username}")
    return user