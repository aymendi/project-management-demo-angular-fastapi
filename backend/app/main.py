from fastapi import FastAPI
from app.db.session import get_db
from app.graphql.schema import get_graphql_router

from app.db.session import engine
from app.db.base import Base
from app.models.user import User
from app.models.product import Product

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "UP"}

graphql_app = get_graphql_router()

# inject DB session in GraphQL context
@app.middleware("http")
async def db_session_middleware(request, call_next):
    response = await call_next(request)
    return response

# Strawberry context (db) via dependency-like pattern
@graphql_app.context_getter
def get_context():
    db = next(get_db())
    return {"db": db}

app.include_router(graphql_app, prefix="/graphql")
