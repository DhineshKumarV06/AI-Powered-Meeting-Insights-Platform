from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENAI_API_KEY: str
    SENDGRID_API_KEY: str
    FROM_EMAIL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REDIS_URL: str = "redis://localhost:6379/0"
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
