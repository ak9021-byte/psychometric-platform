from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    school        = Column(String)
    student_class = Column(String)
    father_name   = Column(String)
    mother_name   = Column(String)
    is_admin      = Column(Boolean, default=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    responses = relationship("Response", back_populates="user")
    results   = relationship("Result",   back_populates="user")


class Question(Base):
    __tablename__ = "questions"
    id             = Column(Integer, primary_key=True, index=True)
    text           = Column(Text,   nullable=False)
    category       = Column(String, nullable=False)
    option_a       = Column(String, nullable=False)
    option_b       = Column(String, nullable=False)
    option_c       = Column(String, nullable=False)
    option_d       = Column(String, nullable=False)
    score_map      = Column(Text)   # JSON  {"a":4,"b":3,"c":2,"d":1}


class Response(Base):
    __tablename__ = "responses"
    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"))
    question_id     = Column(Integer, ForeignKey("questions.id"))
    selected_option = Column(String)
    submitted_at    = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="responses")


class Result(Base):
    __tablename__ = "results"
    id                    = Column(Integer, primary_key=True, index=True)
    user_id               = Column(Integer, ForeignKey("users.id"))
    logical_mathematical  = Column(Float, default=0)
    interpersonal         = Column(Float, default=0)
    bodily_kinesthetic    = Column(Float, default=0)
    verbal_linguistic     = Column(Float, default=0)
    musical               = Column(Float, default=0)
    naturalist            = Column(Float, default=0)
    spatial_visual        = Column(Float, default=0)
    intrapersonal         = Column(Float, default=0)
    riasec_realistic      = Column(Float, default=0)
    riasec_investigative  = Column(Float, default=0)
    riasec_artistic       = Column(Float, default=0)
    riasec_social         = Column(Float, default=0)
    riasec_enterprising   = Column(Float, default=0)
    riasec_conventional   = Column(Float, default=0)
    top_career            = Column(String)
    completed_at          = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="results")