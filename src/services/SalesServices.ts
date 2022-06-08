import { CREATE_ACTION, UPDATE_ACTION } from "../constants/Action"
import { SALES } from "../constants/Firebase"
import { salesRef } from "../functions/Firebase"
import { Customer } from "../types/Customer"
import { addLog } from "./LogServices"


export const createSales = (customer: Customer, quotation_id: string, user: any, onSuccess: (id: string) => void, onError: (err: string) => void) => {
  salesRef
    .add({ quotation_id: quotation_id, customer: customer, created_at: new Date(), created_date: `${new Date().getDate().toString()}/${(new Date().getMonth() + 1).toString()}/${new Date().getFullYear().toString()}` })
    .then(
      (docRef) => {
        addLog(SALES, docRef.id, CREATE_ACTION, user, () => {
          onSuccess(docRef.id);
        }, () => {
          onError("Error creating sales");
        })

      }
    ).catch((err) => {
      onError(err);
    })
}

export const updateSales = (id: string, data: any, user: any, onSuccess: () => void, onError: (err: string) => void) => {
  salesRef
    .doc(id)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(SALES, id, UPDATE_ACTION, user, () => {
          onSuccess();
        }, () => {
          onError("Error updating sales");
        })

      }
    ).catch((err) => {
      onError(err);
    })
}