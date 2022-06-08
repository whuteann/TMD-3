import { Action, APPROVE_ACTION, CREATE_ACTION, REJECT_ACTION, UPDATE_ACTION } from "../constants/Action";
import { PURCHASE_ORDERS } from "../constants/Firebase";
import { purchaseOrderRef } from "../functions/Firebase";
import { APPROVED } from "../types/Common";
import { addLog } from "./LogServices";

const current_time = new Date();

export const createPurchaseOrder = (docID: string, data: any, user: any, onSuccess: (newID) => void, onError: (error: any) => void) => {

  purchaseOrderRef
    .add({ ...{ secondary_id: docID, display_id: docID, created_at: current_time, created_by: user }, ...data })
    .then(
      (docRef) => {
        addLog(PURCHASE_ORDERS, docRef.id, CREATE_ACTION, user!, () => {
          console.log(`Purchase order ${docRef.id} created succesfully`);
          onSuccess(docRef.id);
        }, (error) => {
          onError(`Something went wrong in createPurchaseOrder: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const updatePurchaseOrder = (poID: string | undefined, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseOrderRef.doc(poID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(PURCHASE_ORDERS, poID!, log_action, user!, () => {
          console.log(`Updated purhase order ${poID} successfully`);
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updatePurchaseOrder: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const approvePurchaseOrder = (docID: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseOrderRef
    .doc(docID).update({
      status: APPROVED
    })
    .then(() => {
      addLog(PURCHASE_ORDERS, docID!, APPROVE_ACTION, user!, () => {
        console.log(`Approved purhase order ${docID} successfully`);
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in approvePurchaseOrder: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const rejectPurchaseOrder = (docID: string, reject_notes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseOrderRef
    .doc(docID).update({
      status: "Rejected",
      reject_notes: reject_notes
    })
    .then(() => {
      addLog(PURCHASE_ORDERS, docID!, REJECT_ACTION, user!, () => {
        console.log(`Rejected purhase order ${docID} successfully`);
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in rejectPurchaseOrder: ${error}`);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

export const getPurchaseOrderData = (poID, nextFunction: (data: any) => void) => {
  purchaseOrderRef
    .doc(poID)
    .get()
    .then(
      (item) => {
        nextFunction(item.data());
      }
    )
}