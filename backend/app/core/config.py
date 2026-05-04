from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Team Task Manager"
    app_env: str = "development"
    database_url: str = "sqlite:///./storage/team_task_manager.db"
    secret_key: str = "change-this-secret-before-production"
    access_token_expire_minutes: int = 1440
    frontend_origin: str = "http://localhost:3000"
    frontend_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.database_url.startswith("postgres://"):
        settings.database_url = settings.database_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif settings.database_url.startswith("postgresql://"):
        settings.database_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    Path("storage").mkdir(parents=True, exist_ok=True)
    return settings


def get_allowed_origins() -> list[str]:
    settings = get_settings()
    origins = [item.strip() for item in settings.frontend_origins.split(",") if item.strip()]
    if settings.frontend_origin and settings.frontend_origin not in origins:
        origins.append(settings.frontend_origin)
    return origins
