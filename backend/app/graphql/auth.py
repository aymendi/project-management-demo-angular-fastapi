import strawberry
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.graphql.types import AuthPayload, UserType


def _get_auth_user(db: Session, username: str, password: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid credentials")
    return user


@strawberry.type
class AuthMutations:
    @strawberry.mutation
    def register(self, info, username: str, email: str, password: str) -> AuthPayload:
        db: Session = info.context["db"]

        if db.query(User).filter(User.username == username).first():
            raise ValueError("Username already exists")
        if db.query(User).filter(User.email == email).first():
            raise ValueError("Email already exists")

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="USER",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token(
            {"userId": user.id, "username": user.username, "role": user.role}
        )

        return AuthPayload(
            token=token,
            user=UserType(id=str(user.id), username=user.username, role=user.role),
        )

    @strawberry.mutation
    def login(self, info, username: str, password: str) -> AuthPayload:
        db: Session = info.context["db"]

        user = _get_auth_user(db, username, password)

        token = create_access_token(
            {"userId": user.id, "username": user.username, "role": user.role}
        )

        return AuthPayload(
            token=token,
            user=UserType(id=str(user.id), username=user.username, role=user.role),
        )
