from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database Configuration (Supports SQLite locally or PostgreSQL in Prod)
    DATABASE_URL: str = "sqlite:///./varuna.db"
    
    # Alert Dispatcher API Keys
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""
    MUNICIPAL_WEBHOOK_URL: str = ""
    # WhatsApp Gateway Configuration
    BAILEYS_GATEWAY_URL: str = "http://whatsapp_gateway:3001/api/v1/whatsapp/send-alert"
    WHATSAPP_ALERT_RECIPIENT: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
