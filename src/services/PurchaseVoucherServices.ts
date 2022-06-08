import { Action, APPROVE_ACTION, CREATE_ACTION, REJECT_ACTION, SUBMIT_ACTION, UPDATE_ACTION } from "../constants/Action";
import { PURCHASE_VOUCHERS } from "../constants/Firebase";
import { purchaseVoucherRef } from "../functions/Firebase";
import { APPROVED, DRAFT, IN_REVIEW, PV_ISSUED, REJECTED } from "../types/Common";
import { addLog } from "./LogServices";
import { getPurchaseOrderData, updatePurchaseOrder } from "./PurchaseOrderServices";

const current_time = new Date();


export const createPurchaseVoucher = (data: any, user: any, onSuccess: (id) => void, onError: (error: any) => void) => {

  getPurchaseOrderData(
    data.purchase_order_id,
    (poData) => {

      let purchaseVoucherID: string;
      //if have purchase_vouchers
      if (poData.purchase_vouchers) {
        purchaseVoucherID = `${data.secondary_id}-${poData.purchase_vouchers.length + 1}`

        purchaseVoucherRef
          .add({ ...data, secondary_id: purchaseVoucherID, display_id: purchaseVoucherID, created_at: current_time, created_by: user, status: DRAFT })
          .then(
            (docRef) => {

              addLog(PURCHASE_VOUCHERS, docRef.id, CREATE_ACTION, user!, () => {
                onSuccess(docRef.id);
              }, (error) => {
                onError(`Something went wrong in createPurchaseVoucher: ${error}`);
              });

            }
          )
          .catch(
            (error) => {
              onError(error);
            }
          );
      } else {
        purchaseVoucherID = `${data.secondary_id}-1`

        purchaseVoucherRef
          .add({ ...data, secondary_id: purchaseVoucherID, display_id: purchaseVoucherID, created_at: current_time, created_by: user, status: DRAFT })
          .then(
            (docRef) => {
              addLog(PURCHASE_VOUCHERS, docRef.id, CREATE_ACTION, user!, () => {
                onSuccess(docRef.id);
              }, (error) => {
                onError(`Something went wrong in createPurchaseVoucher: ${error}`);
              });
            }
          )
          .catch(
            (error) => {
              console.error(error);
            }
          );

      }
    }
  )
}

export const confirmPurchaseVoucher = (poID: string, pvID: string, pvSecondaryID: string, revisedCode: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  getPurchaseOrderData(
    poID,
    (poData) => {

      if (poData.purchase_vouchers) {

        let newArr: Array<{ id: string, secondary_id: string }> = poData.purchase_vouchers;
        const searchIndex = newArr.findIndex((pv) => pv.id == pvID);

        if (searchIndex.toString() == "-1") {
          newArr.push({ id: pvID, secondary_id: pvSecondaryID });

          updatePurchaseOrder(poID, { purchase_vouchers: newArr, status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
            updatePurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW }, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {
          });

        } else {
          newArr[searchIndex].secondary_id = pvSecondaryID

          updatePurchaseOrder(poID, { purchase_vouchers: newArr, status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
            updatePurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW }, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {

          });
        }
      } else {
        updatePurchaseOrder(poID, { purchase_vouchers: [{ id: pvID, secondary_id: pvSecondaryID }], status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
          updatePurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW }, user!, SUBMIT_ACTION, () => {
            onSuccess();
          }, () => {
          })
        }, () => {
        });
      }
    }
  );
}

export const updatePurchaseVoucher = (pvID: string | undefined, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseVoucherRef.doc(pvID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(PURCHASE_VOUCHERS, pvID!, log_action, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updatePurchaseVoucher: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const approvePurchaseVoucher = (pvID: string | undefined, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseVoucherRef.doc(pvID)
    .set({ status: APPROVED }, { merge: true })
    .then(
      () => {
        addLog(PURCHASE_VOUCHERS, pvID!, APPROVE_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in approvePurchaseVoucher: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const rejectPurchaseVoucher = (pvID: string | undefined, rejectNotes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  purchaseVoucherRef.doc(pvID)
    .set({ status: REJECTED, reject_notes: rejectNotes }, { merge: true })
    .then(
      () => {
        addLog(PURCHASE_VOUCHERS, pvID!, REJECT_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in approvePurchaseVoucher: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}
