from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models  # ← ADD THIS LINE

from routers import auth, test, report, admin

Base.metadata.create_all(bind=engine)  # now it knows all tables

app = FastAPI(title="Psychometric Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(test.router)
app.include_router(report.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"status": "Psychometric Platform API is running ✅"}