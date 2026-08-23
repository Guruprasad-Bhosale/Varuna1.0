import magic
import os
from fastapi import UploadFile, HTTPException, status
from werkzeug.utils import secure_filename

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

ALLOWED_MIME_TYPES = {
    "text/csv": ".csv",
    "application/vnd.ms-excel": ".csv",
    "application/octet-stream": ".parquet" # Parquet sometimes shows as octet-stream
}

# Known magic bytes for Parquet
PARQUET_MAGIC = b"PAR1"

async def validate_upload_file(file: UploadFile) -> str:
    # 1. Sanitize filename to prevent directory traversal
    safe_filename = secure_filename(file.filename or "unknown_upload")
    
    # 2. Check extension
    ext = os.path.splitext(safe_filename)[1].lower()
    if ext not in [".csv", ".parquet"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file extension. Only .csv and .parquet are allowed."
        )
        
    # 3. Read first few bytes for magic signature and size check
    header = await file.read(2048)
    file_size = len(header)
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
        
    # Check total size if possible
    # We will read chunks to determine total size
    total_size = len(header)
    while chunk := await file.read(1024 * 1024):
        total_size += len(chunk)
        if total_size > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 10MB limit."
            )
            
    # Reset file pointer after reading
    await file.seek(0)
    
    # 4. Check Magic Bytes
    mime = magic.from_buffer(header, mime=True)
    
    if ext == ".parquet":
        if not header.startswith(PARQUET_MAGIC):
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Invalid file signature for Parquet."
            )
    elif ext == ".csv":
        if mime not in ["text/csv", "text/plain", "application/csv"]:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Invalid file signature for CSV. Detected: {mime}"
            )
            
    return safe_filename
