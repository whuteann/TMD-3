import { Action, APPROVE_ACTION, ARCHIVE_ACTION, CREATE_ACTION, DELETE_ACTION, REJECT_ACTION } from "../constants/Action";
import { QUOTATIONS } from "../constants/Firebase";
import { incrementRef, quotationRef } from "../functions/Firebase";
import { APPROVED, ARCHIVED, DATE, QUOTATION_CODE, REJECTED } from "../types/Common";
import { Product } from "../types/Product";
import { addLog } from "./LogServices";

const current_time = new Date();

export const createQuotation = (quotation: any, user: any, onSuccess: (newID) => void, onError: (error: any) => void) => {
  incrementRef
    .where("name", "==", QUOTATIONS)
    .get()
    .then(
      (item) => {
        let prevAmount = item.docs[0].data().amount;
        let newAmount = prevAmount + 1
        let newID = `${QUOTATION_CODE}${DATE}${newAmount}`
        incrementRef.doc(`${item.docs[0].id}`).update({ amount: newAmount });

        quotationRef
          .add({ ...quotation, ...{ secondary_id: newID, display_id: newID, created_at: current_time, deleted: false, created_by: user } })
          .then(
            (docRef) => {
              addLog(QUOTATIONS, docRef.id, CREATE_ACTION, user!, () => {
                onSuccess(docRef.id);
              }, (error) => {
                onError(`Something went wrong in createQuotation ${error}`);
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

export const updateQuotation = (docID: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {
  quotationRef
    .doc(docID).set(data, { merge: true })
    .then(
      () => {
        addLog(QUOTATIONS, docID, log_action, user!, () => {
          onSuccess()
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

export const checkQuotationExist = (secondary_id: string, returnExist: (exist: boolean, quotation_id: string) => void) => {
  quotationRef
    .where("secondary_id", "==", secondary_id)
    .get()
    .then(
      results => {
        if (results.docs.length == 0) {
          returnExist(false, "");
        } else {
          returnExist(true, results.docs[0].id);
        }
      }
    )
}

export const deleteQuotationProducts = (
  docID: string,
  deletedProducts: Array<string>,
  productsList: Array<{ product: Product, quantity: string, unit: string, prices: Array<{ value: string, unit: string }> }> | undefined,
  nextAction: () => void,
) => {

  if (!!productsList) {
    if (!!deletedProducts) {
      deletedProducts.map((item) => {
        let i = productsList.findIndex((obj => obj.product.name == item));
        productsList.splice(i, 1);
      })
    }
  }

  quotationRef
    .doc(docID).update({
      products: productsList,
    })
    .then(
      () => {
        nextAction();
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}

export const deleteQuotation = (docID: string, user: any, onSuccess: () => void, onError: (err: string) => void) => {
  quotationRef
    .doc(docID).set(
      { deleted: true, deleted_at: current_time },
      { merge: true }
    )
    .then(
      () => {
        addLog(QUOTATIONS, docID, DELETE_ACTION, user!, () => {
          onSuccess();
        }, (err) => {
          onError(err)
        })
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}


export const approveQuotation = (docID: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  quotationRef
    .doc(docID).update({
      status: APPROVED
    })
    .then(() => {
      addLog(QUOTATIONS, docID, APPROVE_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in approveQuotation: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const rejectQuotation = (docID: string, rejectNotes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  quotationRef
    .doc(docID).update({
      status: REJECTED,
      reject_notes: rejectNotes
    })
    .then(() => {
      addLog(QUOTATIONS, docID, REJECT_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in approveQuotation: ${error}`);
      });
    })
    .catch((error) => {
      onError(error);
    });
}

export const archiveQuotation = (docID: string, rejectReason: string, rejectNotes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  quotationRef
    .doc(docID).update({
      status: ARCHIVED,
      reject_reason: rejectReason,
      reject_notes: rejectNotes
    })
    .then(() => {
      addLog(QUOTATIONS, docID, ARCHIVE_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in approveQuotation: ${error}`);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}