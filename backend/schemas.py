from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    name:          str
    email:         EmailStr
    password:      str
    school:        str
    student_class: str
    father_name:   Optional[str] = None
    mother_name:   Optional[str] = None

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type:   str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class AnswerSubmit(BaseModel):
    question_id:     int
    selected_option: str

class TestSubmit(BaseModel):
    answers: List[AnswerSubmit]

class QuestionOut(BaseModel):
    id:       int
    text:     str
    category: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    class Config:
        from_attributes = True

class ResultOut(BaseModel):
    logical_mathematical: float
    interpersonal:        float
    bodily_kinesthetic:   float
    verbal_linguistic:    float
    musical:              float
    naturalist:           float
    spatial_visual:       float
    intrapersonal:        float
    riasec_realistic:     float
    riasec_investigative: float
    riasec_artistic:      float
    riasec_social:        float
    riasec_enterprising:  float
    riasec_conventional:  float
    top_career:           Optional[str]
    completed_at:         datetime
    class Config:
        from_attributes = True

class StudentOut(BaseModel):
    id:            int
    name:          str
    email:         str
    school:        Optional[str]
    student_class: Optional[str]
    created_at:    datetime
    class Config:
        from_attributes = True