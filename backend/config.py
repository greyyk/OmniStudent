"""Application configuration.

Settings are read from environment variables (or a .env file in the backend/
directory). Defaults are tuned for local SQLite development — need to swap
DATABASE_URL to a Postgres connection string for the final submission.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).with_name(".env")


class Settings(BaseSettings):
    # SQLite by default (zero setup). For Postgres, set DATABASE_URL in .env,
    # e.g. postgresql+psycopg://user:pass@localhost:5432/omnistudent
    database_url: str = "sqlite:///./omnistudent.db"

    # JWT settings
    secret_key: str = "dev-secret-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # CORS — the Vite dev server origin
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8")


settings = Settings()
