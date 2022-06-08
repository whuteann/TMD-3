import { rfqRef } from "../functions/Firebase";
import Validate from "validate.js";
import { RFQ } from "../types/RFQ";
import moment from "moment";
import { addLog } from "./LogServices";
import { RFQS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createRFQ = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  let {
    code
  } = data;

  getRFQByCode(code, (rfq: RFQ) => {
    onError('Code already exist');
  }, (error) => {
    rfqRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(RFQS, docRef.id, CREATE_ACTION, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createRFQ: ${error}`);
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

export const updateRFQ = (id: string, existingCode: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    code
  } = data;

  if (existingCode == code) {
    rfqRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(RFQS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateRFQ: ${error}`);
          });

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
  getRFQByCode(code, (rfq: RFQ) => {
    onError('Code already exist');
  }, (error) => {
    rfqRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(RFQS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateRFQ: ${error}`);
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

export const getRFQByCode = (code: string, onSuccess: (rfq: RFQ) => void, onError: (error?: string) => void) => {
  rfqRef.where('code', '==', code)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let rfq!: RFQ;

      snapshot.forEach((doc) => {
        rfq = {
          id: doc.id,
          ...doc.data()
        } as RFQ;
      })

      if (!rfq) {
        onError();
        return;
      }

      return onSuccess(rfq);
    });
}

export const deleteRFQ = (id: string, user:any, onSuccess: () => void, onError: (errorMessage: string) => void) => {
  rfqRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(
      (docRef) => {
        addLog(RFQS, id, DELETE_ACTION, user!, () => {
          onSuccess();
        }, (err) => {
          onError(err)
        })
      }
    )
    .catch(
      (error) => {
        onError(error.message);
      }
    );
}