import { productRef } from "../functions/Firebase";
import Validate from "validate.js";
import moment from "moment";
import { Product } from "../types/Product";
import { addLog } from "./LogServices";
import { PRODUCTS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createProduct = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  let {
    sku
  } = data;


  getProductBySKU(sku, (product: Product) => {
    onError('SKU already exist');
  }, (error) => {
    productRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(PRODUCTS, docRef.id, CREATE_ACTION, user!, () => {
            console.log(`Product ${docRef.id} created succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createProduct: ${error}`);
          });
        }
      )
      .catch(
        (error) => {
          onError(error.message);
        }
      );
  });
}

export const updateProduct = (id: string, existingSku: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    sku
  } = data;
  console.log(`hello`);
  if (existingSku == sku) {
    productRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(PRODUCTS, id, log_action, user!, () => {
            console.log(`Product ${id} updated succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateProduct: ${error}`);
          });

          onSuccess();
        }
      )
      .catch(
        (error) => {
          onError(error.message);
        }
      );

    return;
  }

  // Need to check how to update for unique code | TODO
  getProductBySKU(sku, (product: Product) => {
    onError('SKU already exist');
  }, (error) => {
    productRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(PRODUCTS, id, log_action, user!, () => {
            console.log(`Product ${id} updated succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateProduct: ${error}`);
          });
        }
      )
      .catch(
        (error) => {
          onError(error.message);
        }
      );
  });
}

export const getProductBySKU = (sku: string, onSuccess: (product: Product) => void, onError: (error?: string) => void) => {
  productRef.where('sku', '==', sku)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let product!: Product;

      snapshot.forEach((doc) => {
        product = {
          id: doc.id,
          ...doc.data()
        } as Product;
      })

      if (!product) {
        onError('Empty');
        return;
      }

      return onSuccess(product);
    });
}

export const deleteProduct = (id: string, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  productRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() =>
      addLog(PRODUCTS, id, DELETE_ACTION, user!, () => {
        onSuccess();
      }, (err) => {
        onError(err)
      })
    )
    .catch((error) => onError(error.message));
}