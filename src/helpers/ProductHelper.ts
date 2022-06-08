import { Product } from "../types/Product";


export const getProductNames = (products: Array<Product>) => {
  let productsList: Array<string> = [];

  products.map((item) => {
    productsList.push(item.name)
  })

  return { productsList };
}