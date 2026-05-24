"""
Application configuration — loaded from environment / .env file.
All settings are typed with Pydantic so bad config fails fast at startup.
"""
from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Minimum acceptable SECRET_KEY length. 32 ASCII chars ≈ 256 bits of entropy
# when generated from secrets.token_urlsafe — well past the point where an
# offline brute-force on an HS256 JWT signature is feasible.
MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_env: str = "development"
    secret_key: str  # CRITICAL: Must be set via environment variable (no default for security)
    debug: bool = False

    @field_validator("secret_key")
    @classmethod
    def _secret_key_strong_enough(cls, v: str) -> str:
        if len(v) < MIN_SECRET_KEY_LENGTH:
            raise ValueError(
                f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters "
                f"(generate one with `python -c 'import secrets; print(secrets.token_urlsafe(32))'`)."
            )
        return v

    # Anthropic
    anthropic_api_key: str

    # Database
    database_url: str = "postgresql+asyncpg://craftgent:craftgent@localhost:5432/craftgent"

    # Redis (Phase 2)
    redis_url: str = "redis://localhost:6379/0"

    # ChromaDB (Phase 3)
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_collection: str = "craftgent_memory"

    # Tools (Phase 3)
    tavily_api_key: str = ""   # optional — web search disabled if empty
    code_exec_timeout: int = 10  # seconds

    # CORS — comma-separated origins
    cors_origins: str = "http://localhost:5173"

    # Rate limiting
    rate_limit_per_minute: int = 20

    # Email (Phase 4 — optional)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    """Cached settings — only reads env once per process."""
    return Settings()  # type: ignore[call-arg]
