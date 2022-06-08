import { Product } from "../types/Product";
import { addCommaNumber } from "./NumericHelper";

export const generateProductDisplay = (
  productsList: Array<{ product: Product, quantity: string, unit: string, prices: Array<{ value: string, unit: string }> }> | undefined,
) => {
  let productDisplayList: Array<{ name: string, unit: string, prices: Array<{ value: string, unit: string }> }> = [];

  for (let indexL in productsList) {
    let prices: Array<{ value: string, unit: string }> = [];
    for (let indexS in productsList[indexL].prices) {
      prices.push({ value: `${addCommaNumber(productsList[indexL].prices[indexS].value, "0")}`, unit: `${productsList[indexL].prices[indexS].unit} ` });
    }
    productDisplayList.push({ name: productsList[indexL].product.name, unit: `${addCommaNumber(productsList[indexL].quantity, "0")} ${productsList[indexL].unit}`, prices: prices })
  }

  return productDisplayList;
}