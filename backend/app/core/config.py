from pydantic_settings import BaseSettings
from pydantic import model_validator
import os

class Settings(BaseSettings):
    # Database Configuration (Supports SQLite locally or PostgreSQL in Prod)
    DATABASE_URL: str = "sqlite:///./varuna.db"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = ""
    
    # Alert Dispatcher API Keys
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    MUNICIPAL_WEBHOOK_URL: str = ""
    # WhatsApp Gateway Configuration
    BAILEYS_GATEWAY_URL: str = "http://whatsapp_gateway:3001/api/v1/whatsapp/send-alert"
    WHATSAPP_ALERT_RECIPIENT: str = ""
    WHATSAPP_API_TOKEN: str = ""
    
    # Admin
    ADMIN_API_KEY: str = ""
    
    @model_validator(mode='after')
    def validate_production_keys(self) -> 'Settings':
        if self.ENVIRONMENT == 'production':
            if not self.DATABASE_URL or self.DATABASE_URL == "sqlite:///./varuna.db":
                raise ValueError("DATABASE_URL must be explicitly set to a PostgreSQL string in production.")
            if not self.WHATSAPP_API_TOKEN:
                raise ValueError("WHATSAPP_API_TOKEN is missing or empty in production.")
            if not self.ADMIN_API_KEY:
                raise ValueError("ADMIN_API_KEY is missing or empty in production.")
        return self

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
