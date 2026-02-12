import strawberry
from sqlalchemy.orm import Session
from app.models.product import Product
from app.graphql.deps import get_current_user, require_role

@strawberry.type
class ProductType:
    id: strawberry.ID
    name: str
    description: str | None
    price: float
    quantity: int

@strawberry.input
class ProductInput:
    name: str
    description: str | None = None
    price: float
    quantity: int

def to_type(p: Product) -> ProductType:
    return ProductType(
        id=str(p.id),
        name=p.name,
        description=p.description,
        price=float(p.price),
        quantity=p.quantity,
    )

def validate_product_input(inp: ProductInput):
    if not inp.name or len(inp.name) < 2:
        raise ValueError("Validation error: name")
    if inp.price is None or inp.price < 0:
        raise ValueError("Validation error: price")
    if inp.quantity is None or inp.quantity < 0:
        raise ValueError("Validation error: quantity")


@strawberry.type
class ProductQueries:
    @strawberry.field
    def products(self, info) -> list[ProductType]:
        _ = get_current_user(info)  # auth required
        db: Session = info.context["db"]
        items = db.query(Product).order_by(Product.created_at.desc()).all()
        return [to_type(p) for p in items]

    @strawberry.field
    def product_by_id(self, info, id: strawberry.ID) -> ProductType:
        _ = get_current_user(info)
        db: Session = info.context["db"]
        p = db.query(Product).filter(Product.id == int(id)).first()
        if not p:
            raise ValueError("Product not found")
        return to_type(p)


@strawberry.type
class ProductMutations:
    @strawberry.mutation
    def create_product(self, info, input: ProductInput) -> ProductType:
        _ = get_current_user(info)
        validate_product_input(input)
        db: Session = info.context["db"]

        p = Product(
            name=input.name,
            description=input.description,
            price=input.price,
            quantity=input.quantity,
        )
        db.add(p)
        db.commit()
        db.refresh(p)
        return to_type(p)

    @strawberry.mutation
    def update_product(self, info, id: strawberry.ID, input: ProductInput) -> ProductType:
        _ = get_current_user(info)
        validate_product_input(input)
        db: Session = info.context["db"]

        p = db.query(Product).filter(Product.id == int(id)).first()
        if not p:
            raise ValueError("Product not found")

        p.name = input.name
        p.description = input.description
        p.price = input.price
        p.quantity = input.quantity

        db.commit()
        db.refresh(p)
        return to_type(p)

    @strawberry.mutation
    def delete_product(self, info, id: strawberry.ID) -> bool:
        user = get_current_user(info)
        require_role(user, "ADMIN")

        db: Session = info.context["db"]
        p = db.query(Product).filter(Product.id == int(id)).first()
        if not p:
            raise ValueError("Product not found")

        db.delete(p)
        db.commit()
        return True
