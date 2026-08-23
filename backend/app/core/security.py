from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from backend.app.core.config import settings

api_key_header = APIKeyHeader(name="X-Admin-API-Key", auto_error=False)

async def get_admin_user(api_key_header: str = Security(api_key_header)):
    if not settings.ADMIN_API_KEY:
        # Prevent open access if key is accidentally unset
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error"
        )
        
    if api_key_header != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing Admin API Key"
        )
    return True
