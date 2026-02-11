import strawberry

@strawberry.type
class UserType:
    id: strawberry.ID
    username: str
    role: str

@strawberry.type
class AuthPayload:
    token: str
    user: UserType
