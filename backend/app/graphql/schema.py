import strawberry
from strawberry.fastapi import GraphQLRouter
from app.graphql.auth import AuthMutations

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "GraphQL is up"

@strawberry.type
class Mutation(AuthMutations):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

def get_graphql_router():
    return GraphQLRouter(schema)
