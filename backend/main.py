from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models

from routers import auth, test, report, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Psychometric Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://psychometric-platform-pm2c.vercel.app",
        "https://psychometric-platform-pm2c-git-main-akash-gaikwad-s-projects.vercel.app",
        "https://psychometric-platform-pm2c-c2h71a7x1-akash-gaikwad-s-projects.vercel.app",
    ],
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