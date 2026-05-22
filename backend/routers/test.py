from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Question, Response, Result, User
from schemas import TestSubmit, QuestionOut
from auth_utils import get_current_user
from services.scoring import calculate_scores
from typing import List
from datetime import datetime

router = APIRouter(prefix="/test", tags=["Test"])


@router.get("/questions", response_model=List[QuestionOut])
def get_questions(db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found. Please seed the database.")
    return questions


@router.post("/submit")
def submit_test(
    payload: TestSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question_ids = [a.question_id for a in payload.answers]
    questions    = db.query(Question).filter(Question.id.in_(question_ids)).all()

    # Delete old responses
    db.query(Response).filter(Response.user_id == current_user.id).delete()

    # Save new responses
    for answer in payload.answers:
        db.add(Response(
            user_id=current_user.id,
            question_id=answer.question_id,
            selected_option=answer.selected_option,
        ))

    # Calculate scores
    answers_dict = [{"question_id": a.question_id, "selected_option": a.selected_option} for a in payload.answers]
    scores = calculate_scores(answers_dict, questions)

    # Overwrite or create result
    existing  = db.query(Result).filter(Result.user_id == current_user.id).first()
    is_retake = existing is not None

    score_data = dict(
        logical_mathematical  = scores.get("logical_mathematical", 0),
        interpersonal         = scores.get("interpersonal", 0),
        bodily_kinesthetic    = scores.get("bodily_kinesthetic", 0),
        verbal_linguistic     = scores.get("verbal_linguistic", 0),
        musical               = scores.get("musical", 0),
        naturalist            = scores.get("naturalist", 0),
        spatial_visual        = scores.get("spatial_visual", 0),
        intrapersonal         = scores.get("intrapersonal", 0),
        riasec_realistic      = scores.get("riasec_realistic", 0),
        riasec_investigative  = scores.get("riasec_investigative", 0),
        riasec_artistic       = scores.get("riasec_artistic", 0),
        riasec_social         = scores.get("riasec_social", 0),
        riasec_enterprising   = scores.get("riasec_enterprising", 0),
        riasec_conventional   = scores.get("riasec_conventional", 0),
        top_career            = scores.get("top_career", ""),
        top_5_careers         = scores.get("top_5_careers", []),
        personality_clarity   = scores.get("personality_clarity", ""),
        trait_variance        = scores.get("trait_variance", 0),
        completed_at          = datetime.utcnow(),
    )

    if existing:
        for key, val in score_data.items():
            setattr(existing, key, val)
    else:
        db.add(Result(user_id=current_user.id, **score_data))

    db.commit()
    return {
        "message":    "Test submitted successfully",
        "top_career": scores.get("top_career"),
        "top_5":      scores.get("top_5_careers", []),
        "is_retake":  is_retake,
    }