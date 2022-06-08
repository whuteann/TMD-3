import { incrementRef, invoiceRef } from "../functions/Firebase";
import { INVOICES } from "../constants/Firebase";
import { DATE, INVOICE_CODE, JOB_CONFIRMATION_CODE } from "../types/Common";
import { addLog } from "./LogServices";
import { Action, APPROVE_ACTION, CREATE_ACTION, DELETE_ACTION, REJECT_ACTION } from "../constants/Action";
import moment from "moment";

const replace_string = INVOICE_CODE
const current_time = new Date();


export const createInvoice = (jobID: string, newInvoice: any, user: any, onSuccess: (id, display_id) => void, onError: (error) => void) => {

  incrementRef
    .where("name", "==", INVOICES)
    .get()
    .then(
      (item) => {
        let prevAmount = item.docs[0].data().amount;
        let newAmount = prevAmount + 1
        
        
        let newID = `${INVOICE_CODE}${DATE}${jobID.split(" / ")[3]}-${newAmount}`

        incrementRef.doc(`${item.docs[0].id}`).update({ amount: newAmount });

        invoiceRef
          .add({ ...newInvoice, created_at: current_time, secondary_id: newID, display_id: newID, created_by: user })
          .then(
            (docRef) => {
              addLog(INVOICES, docRef.id, CREATE_ACTION, user!, () => {
                onSuccess(docRef.id, newID);
              }, (error) => {
                onError(`Something went wrong in createInvoice: ${error}`);
              });
            }
          )
          .catch(
            (error) => {
              onError(error);
            }
          );
      }
    );
}

export const updateInvoice = (docID: string, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {
  invoiceRef.doc(docID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(INVOICES, docID, log_action, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in createInvoice: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const deleteInvoice = (docID: string, user:any, onSuccess: () => void, onError: (error: string) => void) => {

  invoiceRef.doc(docID)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() =>
      addLog(INVOICES, docID, DELETE_ACTION, user!, () => {
        onSuccess();
      }, (err) => {
        onError(err)
      })
    )
    .catch((error) => onError(error.message));
}

export const approveInvoice = (docID: string, user: any, onError: (error: any) => void) => {
  invoiceRef
    .doc(docID).update({
      status: "Approved"
    })
    .then(() => {
      addLog(INVOICES, docID, APPROVE_ACTION, user!, () => {
      }, (error) => {
        onError(`Something went wrong in approveInvoice: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const rejectInvoice = (docID: string, rejectNotes: string, user: any, onError: (error: any) => void) => {
  invoiceRef
    .doc(docID).update({
      status: "Rejected",
      reject_notes: rejectNotes
    })
    .then(() => {
      addLog(INVOICES, docID, REJECT_ACTION, user!, () => {
      }, (error) => {
        onError(`Something went wrong in rejectInvoice: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const getInvoiceData = (invID, nextFunction: (data: any) => void) => {
  invoiceRef
    .doc(invID)
    .get()
    .then(
      (item) => {
        nextFunction(item.data());
      }
    )
}