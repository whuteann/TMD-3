import { CREATE_ACTION, UPDATE_ACTION } from "../constants/Action";
import { PROCUREMENTS } from "../constants/Firebase";
import { incrementRef, procurementRef } from "../functions/Firebase";
import { DATE, PROCUREMENT_CODE } from "../types/Common";
import { addLog } from "./LogServices";

const current_time = new Date();

export const createProcurement = (procurement: any, user: any, onSuccess: ({ newID, displayID }) => void, onError: (error) => void) => {

  incrementRef
    .where("name", "==", PROCUREMENTS)
    .get()
    .then(
      (item) => {
        let prevAmount = item.docs[0].data().amount;
        let newAmount = prevAmount + 1
        let newID = `${PROCUREMENT_CODE}${DATE}${newAmount}`
        incrementRef.doc(`${item.docs[0].id}`).update({ amount: newAmount });

        procurementRef
          .add({ ...{ secondary_id: newID, created_at: current_time, status: "Requesting", created_by: user }, ...procurement })
          .then(
            (docRef) => {
              addLog(PROCUREMENTS, docRef.id, CREATE_ACTION, user!, () => {
                console.log(`Created procurement ${docRef.id} succesfully`);
                onSuccess({ newID: docRef.id, displayID: newID })
              }, (error) => {
                onError(`Something went wrong in createProcurement: ${error}`);
              });
            }
          )
          .catch(
            (error) => {
              console.error(error);
            }
          );
      }
    );
}

export const updateProcurement = (docID: string, data: Object, user: any, onSuccess: () => void, onError: (error) => void) => {
  procurementRef.doc(docID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(PROCUREMENTS, docID, UPDATE_ACTION, user!, () => {
          console.log(`Updated procurement ${docID} successfully`);
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateProcurement: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}