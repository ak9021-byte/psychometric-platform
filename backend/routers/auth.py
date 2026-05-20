from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, Token
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_token(user_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120)))
    payload = {"sub": str(user_id), "email": email, "exp": expire}
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))

@router.post("/register", response_model=Token)
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=pwd_context.hash(user.password[:72]),  # ✅ fixed
        school=user.school,
        student_class=user.student_class,
        father_name=user.father_name,
        mother_name=user.mother_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"access_token": create_token(new_user.id, new_user.email), "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password[:72], db_user.hashed_password):  # ✅ fixed
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_token(db_user.id, db_user.email), "token_type": "bearer"}