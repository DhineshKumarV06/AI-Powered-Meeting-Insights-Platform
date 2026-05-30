from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import meetings, auth, recordings, summaries


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI Meeting Assistant",
    description="Record, transcribe, summarize meetings and send email summaries.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["meetings"])
app.include_router(recordings.router, prefix="/api/recordings", tags=["recordings"])
app.include_router(summaries.router, prefix="/api/summaries", tags=["summaries"])


@app.get("/")
def root():
    return {"message": "AI Meeting Assistant API is running ✅"}
