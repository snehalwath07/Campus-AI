import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.config.settings import settings

# Custom CryptContext class that mimics passlib.context.CryptContext.
# This prevents passlib startup crashes on Python 3.14 caused by its internal 
# test runs exceeding bcrypt's 72-byte limit.
class CryptContext:
    def __init__(self, schemes=None, deprecated=None):
        self.schemes = schemes

    def hash(self, secret: str) -> str:
        """Hash password using bcrypt."""
        # Ensure password is under bcrypt's limit
        pw_bytes = secret.encode("utf-8")
        if len(pw_bytes) > 72:
            # Standard bcrypt truncation limit is 72 bytes
            pw_bytes = pw_bytes[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

    def verify(self, secret: str, hashed: str) -> bool:
        """Verify plain password against hashed password."""
        try:
            pw_bytes = secret.encode("utf-8")
            if len(pw_bytes) > 72:
                pw_bytes = pw_bytes[:72]
            return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))
        except Exception:
            return False

# Initialize the context matching passlib signature
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
