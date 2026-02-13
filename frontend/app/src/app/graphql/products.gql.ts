import { gql } from 'apollo-angular';

export const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      description
      price
      quantity
    }
  }
`;

export const PRODUCT_BY_ID_QUERY = gql`
  query ProductById($id: ID!) {
    productById(id: $id) {
      id
      name
      description
      price
      quantity
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      quantity
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      quantity
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
