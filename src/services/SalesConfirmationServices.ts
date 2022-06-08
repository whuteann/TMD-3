import { salesConfirmationRef } from "../functions/Firebase";
import { SalesConfirmation } from "../types/SalesConfirmation";
import { Product } from "../types/Product";
import { QUOTATION_CODE, SALES_CODE } from "../types/Common";
import { addLog } from "./LogServices";
import { SALES_CONFIRMATIONS } from "../constants/Firebase";
import { Action, CREATE_ACTION, UPDATE_ACTION } from "../constants/Action";


const to_replace_string = QUOTATION_CODE;
const replace_string = SALES_CODE;
const current_time = new Date();

export const createSalesConfirmation = (quotationID: string, quotation: any, products: Array<{ product: Product, unit: string, quantity: string, price: { value: string, unit: string } }>, user: any, onSuccess: (id: string) => void, onError: (error: any) => void) => {
  let salesID = quotation.secondary_id.replace(to_replace_string, replace_string);
  const current_date = `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}`;
  delete quotation['products'];

  let sales_confirmation: SalesConfirmation =
  {
    secondary_id: salesID,
    quotation_date: quotation.quotation_date,
    customer: quotation.customer,

    port: quotation.port,
    delivery_location: quotation.delivery_location,
    bunker_barges: quotation.bunker_barges,

    receiving_vessel_name: quotation.receiving_vessel_name,
    delivery_date: quotation.delivery_date,
    delivery_mode: quotation.delivery_mode,
    remarks: quotation.remarks,
    currency_rate: quotation.currency_rate,
    barging_fee: quotation.barging_fee,
    barging_remark: quotation.barging_remark,
    conversion_factor: quotation.conversion_factor,
    payment_term: quotation.payment_term,
    validity_date: quotation.validity_date,
    validity_time: quotation.validity_time,
    quotation_id: quotationID,
    quotation_secondary_id: quotation.display_id,
    confirmed_date: current_date,
    products: products,
    created_by: user,
    status: "Not Confirmed",
    sales_id: quotation.sales_id
  };

  if (quotation.purchase_order_file) {
    sales_confirmation = {
      ...sales_confirmation,
      purchase_order_file: quotation.purchase_order_file,
      purchase_order_no: quotation.purchase_order_no || "",
      filename_storage: quotation.filename_storage
    }
  }

  salesConfirmationRef
    .add({ ...sales_confirmation, created_at: current_time, })
    .then(
      (docRef) => {
        addLog(SALES_CONFIRMATIONS, docRef.id, CREATE_ACTION, user!, () => {
          onSuccess(docRef.id);
        }, (error) => {
          onError(`Something went wrong in createSalesConfirmation ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}

export const recreateSalesConfirmation = (docID: string | undefined, quotation: any, products: Array<{ product: Product, unit: string, price: { value: string, unit: string } }>, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  let salesID = quotation.secondary_id.replace(to_replace_string, replace_string);
  delete quotation['products'];
  delete quotation['prices'];

  let sales_confirmation =
  {
    secondary_id: salesID,
    quotation_date: quotation.quotation_date,
    customer: quotation.customer,
    port: quotation.port,
    delivery_location: quotation.delivery_location,
    delivery_date: quotation.delivery_date,
    delivery_mode: quotation.delivery_mode,
    remarks: quotation.remarks,
    currency_rate: quotation.currency_rate,
    barging_fee: quotation.barging_fee,
    barging_remark: quotation.barging_remark,
    conversion_factor: quotation.conversion_factor,
    payment_term: quotation.payment_term,
    validity_date: quotation.validity_date,
    validity_time: quotation.validity_time,
    bunker_barges: quotation.bunker_barges,
    receiving_vessel_name: quotation.receiving_vessel_name,
    quotation_id: quotation.id,
    quotation_secondary_id: quotation.secondary_id,
    products: products,
    purchase_order_file: "",
    purchase_order_no: "",
    filename_storage: "",
    created_by: user,
  };

  if (quotation.purchase_order_file) {
    sales_confirmation = {
      ...sales_confirmation,
      purchase_order_file: quotation.purchase_order_file,
      purchase_order_no: quotation.purchase_order_no || "",
      filename_storage: quotation.filename_storage
    }
  }
  
  salesConfirmationRef
    .doc(docID).set(
      {
        ...sales_confirmation,
      }, { merge: true })
    .then(
      () => {
        addLog(SALES_CONFIRMATIONS, docID!, UPDATE_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in recreateSalesConfirmation: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(`Error writing document: ${error}`);
      }
    );
}

export const updateSalesConfirmation = (docID: string, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error) => void) => {
  salesConfirmationRef.doc(docID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(SALES_CONFIRMATIONS, docID!, log_action, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateSalesConfirmation ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}