import { bankRef } from "../functions/Firebase";
import Validate from "validate.js";
import moment from "moment";
import { Bank } from "../types/Bank";
import { addLog } from "./LogServices";
import { BANKS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createBank = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  let {
    account_no
  } = data;

  getBankByAccountNo(account_no, (bank: Bank) => {
    onError('Account No already exist');
  }, (error) => {
    bankRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(BANKS, docRef.id, CREATE_ACTION, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createBank ${error}`);
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

export const updateBank = (id: string, existingAccountNo: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    account_no
  } = data;

  if (existingAccountNo == account_no) {
    bankRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(BANKS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createBank ${error}`);
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
  getBankByAccountNo(account_no, (bank: Bank) => {
    onError('Account No already exist');
  }, (error) => {
    bankRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(BANKS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createBank ${error}`);
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

export const getBankByAccountNo = (account_no: string, onSuccess: (bank: Bank) => void, onError: (error?: string) => void) => {
  bankRef.where('account_no', '==', account_no)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let bank!: Bank;

      snapshot.forEach((doc) => {
        bank = {
          id: doc.id,
          ...doc.data()
        } as Bank;
      })

      if (!bank) {
        onError('Empty');
        return;
      }

      return onSuccess(bank);
    });
}

export const deleteBank = (id: string, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  bankRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() =>
      addLog(BANKS, id, DELETE_ACTION, user!, () => {
        onSuccess()
      }, (err) => {
        onError(err)
      })
    )
    .catch((error) => onError(error.message));
}

