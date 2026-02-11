from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Schema base de usuário."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Schema para criação de usuário."""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """Schema para login."""
    username: str
    password: str


class UserUpdate(BaseModel):
    """Schema para atualização de usuário."""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)


class User(UserBase):
    """Schema de usuário completo."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema de token JWT."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema de dados do token."""
    user_id: Optional[int] = None
    username: Optional[str] = None