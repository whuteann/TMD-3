import { salesPaymentTermRef } from "../functions/Firebase";
import { PaymentTerm } from "../types/PaymentTerm";
import Validate from "validate.js";
import moment from "moment";
import { addLog } from "./LogServices";
import { SALES_PAYMENT_TERMS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";


export const createPaymentTermSales = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  getPaymentTermDetailByName(name, (paymentTerm: PaymentTerm) => {
    onError('PaymentTerm already exist');
  }, (error) => {
    salesPaymentTermRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(SALES_PAYMENT_TERMS, docRef.id, CREATE_ACTION, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createPort: ${error}`);
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

export const updatePaymentTermSales = (id: string, existingName: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;


  if (existingName !== name) {
    salesPaymentTermRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(SALES_PAYMENT_TERMS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateSalesPaymentTerm: ${error}`);
          });
        }
      )
      .catch(
        (error) => {
          onError(error.message);
        }
      );

    return;
  }else{
    onError("Payment Term already exists");
  }
}

export const deletePaymentTermSales = (id: string, user:any, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  salesPaymentTermRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() => {
      addLog(SALES_PAYMENT_TERMS, id, DELETE_ACTION, user!, () => {
        onSuccess('Successfully delete.');
      }, (err) => {
        onError(err)
      })
    })
    .catch((err) => {
      onError(err.message);
    });
}

const getPaymentTermDetailByName = (name: string, onSuccess: (port: PaymentTerm) => void, onError: (error?: string) => void) => {
  salesPaymentTermRef.where('name', '==', name)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let paymentTerm!: PaymentTerm;

      snapshot.forEach((doc) => {
        paymentTerm = {
          id: doc.id,
          ...doc.data()
        } as PaymentTerm;
      })

      if (!paymentTerm) {
        onError();
        return;
      }

      return onSuccess(paymentTerm);
    });
}