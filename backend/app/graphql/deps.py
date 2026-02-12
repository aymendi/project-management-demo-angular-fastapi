from sqlalchemy.orm import Session
from app.core.security import decode_token

def get_current_user(info):
    request = info.context["request"]
    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise ValueError("Unauthorized")
    token = auth.split(" ", 1)[1].strip()
    return decode_token(token)

def require_role(user_payload: dict, role: str):
    if user_payload.get("role") != role:
        raise ValueError("Forbidden")
