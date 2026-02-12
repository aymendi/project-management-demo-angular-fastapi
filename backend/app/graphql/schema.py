import strawberry
from app.graphql.auth import AuthMutations
from app.graphql.products import ProductQueries, ProductMutations

@strawberry.type
class Query(ProductQueries):
    @strawberry.field
    def hello(self) -> str:
        return "GraphQL is up"

@strawberry.type
class Mutation(AuthMutations, ProductMutations):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)
