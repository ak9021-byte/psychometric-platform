from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Result
from schemas import StudentOut
from auth_utils import get_admin_user
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/students", response_model=List[StudentOut])
def get_all_students(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(User).filter(User.is_admin == False).all()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    total_students = db.query(User).filter(User.is_admin == False).count()
    total_completed = db.query(Result).count()
    results = db.query(Result).all()
    if not results:
        return {"total_students": total_students, "total_completed": 0, "avg_scores": {}}
    avg_scores = {
        "logical_mathematical": round(sum(r.logical_mathematical for r in results) / len(results), 2),
        "interpersonal":        round(sum(r.interpersonal        for r in results) / len(results), 2),
        "bodily_kinesthetic":   round(sum(r.bodily_kinesthetic   for r in results) / len(results), 2),
        "verbal_linguistic":    round(sum(r.verbal_linguistic     for r in results) / len(results), 2),
        "musical":              round(sum(r.musical               for r in results) / len(results), 2),
        "riasec_social":        round(sum(r.riasec_social         for r in results) / len(results), 2),
        "riasec_enterprising":  round(sum(r.riasec_enterprising   for r in results) / len(results), 2),
    }
    top_careers = {}
    for r in results:
        if r.top_career:
            top_careers[r.top_career] = top_careers.get(r.top_career, 0) + 1
    return {
        "total_students":  total_students,
        "total_completed": total_completed,
        "avg_scores":      avg_scores,
        "top_careers":     top_careers,
    }