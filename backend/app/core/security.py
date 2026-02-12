from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Gera hash da senha."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Cria token JWT."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    print(f"🔐 [CREATE TOKEN] Dados para codificar: {to_encode}")
    print(f"🔐 [CREATE TOKEN] SECRET_KEY: {settings.SECRET_KEY[:20]}...")
    print(f"🔐 [CREATE TOKEN] ALGORITHM: {settings.ALGORITHM}")
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    print(f"🔐 [CREATE TOKEN] Token criado: {encoded_jwt[:50]}...")
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica token JWT."""
    try:
        print(f"🔓 [DECODE TOKEN] Token recebido: {token[:50]}...")
        print(f"🔓 [DECODE TOKEN] SECRET_KEY: {settings.SECRET_KEY[:20]}...")
        print(f"🔓 [DECODE TOKEN] ALGORITHM: {settings.ALGORITHM}")
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        print(f"🔓 [DECODE TOKEN] Payload decodificado com sucesso: {payload}")
        
        return payload
    except JWTError as e:
        print(f"❌ [DECODE TOKEN] Erro ao decodificar: {type(e).__name__}: {str(e)}")
        return None