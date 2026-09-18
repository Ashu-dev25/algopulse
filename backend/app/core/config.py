from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 1) Application Metadata
    PROJECT_NAME: str = "AlgoPulse Backend API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # 2) MongoDB Connection Settings (Atlas Free Tier or Local)
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "algopulse"
    
    # 3) JWT Security Settings
    JWT_SECRET_KEY: str = "algopulse_super_secret_cyberpunk_key_2026_change_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # 4) User Default Preferences
    DEFAULT_DAILY_TARGET: int = 2
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"

    class Config:
        env_file = ".env"
        extra = "ignore"

# 5) Initialize global settings instance
settings = Settings()
