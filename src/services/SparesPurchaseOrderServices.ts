import { Action, APPROVE_ACTION, CREATE_ACTION, REJECT_ACTION, VERIFY_ACTION } from "../constants/Action";
import { SPARES_PURCHASE_ORDERS } from "../constants/Firebase";
import { sparesPurchaseOrderRef } from "../functions/Firebase";
import { APPROVED, REJECTED, VERIFIED } from "../types/Common";
import { addLog } from "./LogServices";

const current_time = new Date;

export const createSparesPurchaseOrder = (docID: string, data: any, user: any, onSuccess: (newID) => void, onError: (error: string) => void) => {
  sparesPurchaseOrderRef
    .add({ ...{ secondary_id: docID, created_at: current_time, created_by: user }, ...data })
    .then(
      (docRef) => {
        addLog(SPARES_PURCHASE_ORDERS, docRef.id, CREATE_ACTION, user!, () => {
          onSuccess(docRef.id);
        }, (error) => {
          onError(`Something went wrong in createSparesPurchaseOrder: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const updateSparesPurchaseOrder = (poID: string | undefined, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error) => void) => {
  sparesPurchaseOrderRef.doc(poID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(SPARES_PURCHASE_ORDERS, poID!, log_action, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in createSparesPurchaseOrder: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}

export const approveSparesPurchaseOrder = (docID: string, user: any, onSuccess: () => void, onError: (error) => void) => {
  sparesPurchaseOrderRef
    .doc(docID).update({
      status: APPROVED,
    })
    .then(() => {
      addLog(SPARES_PURCHASE_ORDERS, docID, APPROVE_ACTION, user!, () => {
        onSuccess()
      }, (error) => {
        onError(`Something went wrong in createSparesPurchaseOrder: ${error}`);
      });


    })
    .catch((error) => {
      onError(error);
    });
}

export const rejectSparesPurchaseOrder = (docID: string, rejectNotes: string, user: any, onSuccess: () => void, onError: (error) => void) => {
  sparesPurchaseOrderRef
    .doc(docID).update({
      status: REJECTED,
      reject_notes: rejectNotes
    })
    .then(() => {
      addLog(SPARES_PURCHASE_ORDERS, docID, REJECT_ACTION, user!, () => {
        onSuccess()
      }, (error) => {
        onError(`Something went wrong in createSparesPurchaseOrder: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const verifySparesPurchaseOrder = (docID: string, user: any, onSuccess: () => void, onError: (error) => void) => {
  sparesPurchaseOrderRef
    .doc(docID).update({
      status: VERIFIED,
    })
    .then(() => {
      addLog(SPARES_PURCHASE_ORDERS, docID, VERIFY_ACTION, user!, () => {
        onSuccess()
      }, (error) => {
        onError(`Something went wrong in createSparesPurchaseOrder: ${error}`);
      });

    })
    .catch((error) => {
      onError(error);
    });
}

export const getSparesPurchaseOrderData = (poID, nextFunction: (data: any) => void) => {
  sparesPurchaseOrderRef
    .doc(poID)
    .get()
    .then(
      (item) => {
        nextFunction(item.data());
      }
    )
}