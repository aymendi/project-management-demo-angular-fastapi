from fastapi import FastAPI, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import HTTPConnection
from strawberry.fastapi import GraphQLRouter

from app.db.session import SessionLocal, engine
from app.db.base import Base

from app.models.user import User  # noqa
from app.models.product import Product  # noqa
from app.graphql.schema import schema

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    request.state.db = SessionLocal()
    try:
        return await call_next(request)
    finally:
        request.state.db.close()

def get_context(request: Request, background_tasks: BackgroundTasks, connection: HTTPConnection):
    db = request.state.db

    user = None
    auth = request.headers.get("authorization")  # header names are case-insensitive

    if auth and auth.lower().startswith("bearer "):
        token = auth.split(" ", 1)[1].strip()
        try:
            payload = decode_token(token)
            user_id = payload.get("userId")
            if user_id is not None:
                user = db.query(User).filter(User.id == int(user_id)).first()
        except Exception:
            user = None

    return {
        "request": request,
        "db": db,
        "user": user,
        "background_tasks": background_tasks,
        "connection": connection,
    }

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

@app.get("/health")
def health():
    return {"status": "UP"}

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
