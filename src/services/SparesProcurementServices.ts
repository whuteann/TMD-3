import { Action, APPROVE_ACTION, CREATE_ACTION, REJECT_ACTION } from "../constants/Action";
import { SPARES_PROCUREMENTS } from "../constants/Firebase";
import { incrementRef, sparesProcurementRef } from "../functions/Firebase";
import { APPROVED, DATE, DRAFT, REJECTED, SPARES_PROCUREMENT_CODE } from "../types/Common";
import { addLog } from "./LogServices";

const current_time = new Date();

export const createSparesProcurement = (sparesProcurement: any, user: any, onSuccess: (newID) => void, onError: (error: any) => void) => {

  incrementRef
    .where("name", "==", SPARES_PROCUREMENTS)
    .get()
    .then(
      (item) => {
        let prevAmount = item.docs[0].data().amount;
        let newAmount = prevAmount + 1
        let newID = `${SPARES_PROCUREMENT_CODE}${DATE}${newAmount}`
        incrementRef.doc(`${item.docs[0].id}`).update({ amount: newAmount });

        sparesProcurementRef
          .add({ ...{ secondary_id: newID, display_id: newID, created_at: current_time, status: DRAFT, created_by: user }, ...sparesProcurement })
          .then(
            (docRef) => {
              addLog(SPARES_PROCUREMENTS, docRef.id, CREATE_ACTION, user!, () => {
                console.log(`Created spares procurement ${docRef.id} succesfully`);
                onSuccess(docRef.id);
              }, (error) => {
                onError(`Something went wrong in updateQuotation: ${error}`);
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

export const updateSparesProcurement = (docID: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {

  sparesProcurementRef.doc(docID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(SPARES_PROCUREMENTS, docID, log_action, user!, () => {
          console.log(`Updated spares procurement ${docID} successfully`);
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateQuotation: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const approveSparesProcurement = (docID: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {

  sparesProcurementRef.doc(docID)
    .set({ status: APPROVED }, { merge: true })
    .then(
      () => {
        addLog(SPARES_PROCUREMENTS, docID, APPROVE_ACTION, user!, () => {
          console.log(`Approved spares procurement ${docID} successfully`);
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateQuotation: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const rejectSparesProcurement = (docID: string, rejectNotes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {

  sparesProcurementRef.doc(docID)
    .set({ status: REJECTED, reject_notes: rejectNotes }, { merge: true })
    .then(
      () => {
        addLog(SPARES_PROCUREMENTS, docID, REJECT_ACTION, user!, () => {
          console.log(`Rejected spares procurement ${docID} successfully`);
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateQuotation: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}