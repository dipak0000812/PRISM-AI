"""
PRISM Configuration — Immutable environment bindings via Pydantic Settings.
"""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Core configuration matrix. 
    Defines the exact required keys for the PRISM pipeline to boot securely.
    Fails fast if gitlab_pat or webhook_secret are missing to prevent silent auth drops.
    """

    gitlab_pat: str = Field(..., description="GitLab Personal Access Token with api + ai_features scope")
    groq_api_key: str = Field(default="", description="Groq API key for Llama 3.3")
    webhook_secret: str = Field(..., description="Secret token configured in GitLab webhook settings")
    database_url: str = Field(..., description="PostgreSQL async connection string")
    repo_cache_dir: str = Field(default="/tmp/prism/repos", description="Local repo cache directory")
    max_graph_depth: int = Field(default=5, description="Max BFS traversal depth for blast radius")
    risk_block_threshold: int = Field(default=80, description="Risk score threshold for auto-labeling high-risk")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """
    Instantiates and caches the settings singleton.
    Guarantees environment variables are only parsed once during the application lifecycle.
    """
    return Settings()


settings = get_settings()
