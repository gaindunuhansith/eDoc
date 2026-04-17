import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    public_key = settings.RS256_PUBLIC_KEY
    if not public_key:
        raise HTTPException(status_code=500, detail="JWT public key is not configured. Set JWT_PUBLIC_KEY_BASE64 or PUBLIC_KEY_PATH.")

    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def require_role(required_role: str):
    def role_checker(payload: dict = Security(get_current_user)):
        user_role = payload.get("role")
        if user_role != required_role:
            raise HTTPException(status_code=403, detail=f"Operation requires {required_role} role. Found: {user_role}")
        return payload
    return role_checker
