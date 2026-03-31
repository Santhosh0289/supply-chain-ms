from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from app.core.security import decode_token
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise credentials_exception
        return {"id": user_id, "role": role}
    except JWTError:
        raise credentials_exception

# Role-based guards — use as route dependencies
def require_roles(*roles: str):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user['role']}' is not permitted for this action."
            )
        return current_user
    return role_checker

# Shorthand guards
AdminOnly       = Depends(require_roles("admin"))
AdminOrManager  = Depends(require_roles("admin", "manager"))
AnyRole         = Depends(get_current_user)