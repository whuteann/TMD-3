import { Action, APPROVE_ACTION, CREATE_ACTION, REJECT_ACTION, SUBMIT_ACTION, UPDATE_ACTION } from "../constants/Action";
import { SPARES_PURCHASE_VOUCHERS } from "../constants/Firebase";
import { sparesPurchaseVoucherRef } from "../functions/Firebase";
import { APPROVED, DRAFT, IN_REVIEW, PV_ISSUED, REJECTED } from "../types/Common";
import { addLog } from "./LogServices";
import { getSparesPurchaseOrderData, updateSparesPurchaseOrder } from "./SparesPurchaseOrderServices";

const current_time = new Date;

// export const createSparesPurchaseVoucher = (docID: string, data: any, user: any, onSuccess: (newID) => void, onError: (error: any) => void) => {
//   sparesPurchaseVoucherRef
//     .add({ ...{ secondary_id: docID, created_at: current_time, status: DRAFT, created_by: user }, ...data })
//     .then(
//       (docRef) => {
//         addLog(SPARES_PURCHASE_VOUCHERS, docRef.id, CREATE_ACTION, user!, () => {
//           console.error(`Purchase voucher ${docRef.id} created succesfully`);
//           onSuccess(docRef.id);
//         }, (error) => {
//           onError(`Something went wrong in createSparesPurchaseVoucher: ${error}`);
//         });
//       }
//     )
//     .catch(
//       (error) => {
//         onError(error);
//       }
//     );
// }

export const createSparesPurchaseVoucher = (data: any, user: any, onSuccess: (id) => void, onError: (error: any) => void) => {

  getSparesPurchaseOrderData(
    data.spares_purchase_order_id,
    (poData) => {
      let purchaseVoucherID: string;
      //if have spare_purchase_vouchers
      if (poData.spares_purchase_vouchers) {
        purchaseVoucherID = `${data.secondary_id}-${poData.spares_purchase_vouchers.length + 1}`

        sparesPurchaseVoucherRef
          .add({ ...data, secondary_id: purchaseVoucherID, display_id: purchaseVoucherID, created_at: current_time, created_by: user, status: DRAFT })
          .then(
            (docRef) => {

              addLog(SPARES_PURCHASE_VOUCHERS, docRef.id, CREATE_ACTION, user!, () => {
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

        sparesPurchaseVoucherRef
          .add({ ...data, secondary_id: purchaseVoucherID, display_id: purchaseVoucherID, created_at: current_time, created_by: user, status: DRAFT })
          .then(
            (docRef) => {
              addLog(SPARES_PURCHASE_VOUCHERS, docRef.id, CREATE_ACTION, user!, () => {
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

export const confirmSparesPurchaseVoucher = (poID: string, pvID: string, paid_amount:string, pvSecondaryID: string, revisedCode: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  
  const voucher_no: number = Number( pvSecondaryID.split("")[pvSecondaryID.split("").length - 1])

  getSparesPurchaseOrderData(
    poID,
    (poData) => {

      let total_payable: number = Number(poData.total_amount);
      let paid_amount_number: number = Number(paid_amount);

      if (poData.spares_purchase_vouchers) {

        let newArr: Array<{ id: string, secondary_id: string, paid_amount: string }> = poData.spares_purchase_vouchers;
        let spliceArr: Array<{ id: string, secondary_id: string, paid_amount: string }> = [...newArr];
        let amount_paid: number = 0;
        const searchIndex = newArr.findIndex((pv) => pv.id == pvID);

        spliceArr.splice(voucher_no - 1, 1);

        spliceArr.map(item => {
          amount_paid = amount_paid + Number(item.paid_amount);
        })

        if (searchIndex.toString() == "-1") {
          newArr.push({ id: pvID, secondary_id: pvSecondaryID, paid_amount: paid_amount });

          updateSparesPurchaseOrder(poID, { spares_purchase_vouchers: newArr, status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
            updateSparesPurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW, balance_owing: `${total_payable - amount_paid - paid_amount_number}` }, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {
          });

        } else {
          newArr[searchIndex].secondary_id = pvSecondaryID
          newArr[searchIndex].paid_amount = paid_amount

          updateSparesPurchaseOrder(poID, { spares_purchase_vouchers: newArr, status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
            updateSparesPurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW, balance_owing: `${total_payable - amount_paid - paid_amount_number}` }, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {

          });
        }
      } else {
        updateSparesPurchaseOrder(poID, { spares_purchase_vouchers: [{ id: pvID, secondary_id: pvSecondaryID, paid_amount: paid_amount }], status: PV_ISSUED }, user!, UPDATE_ACTION, () => {
          updateSparesPurchaseVoucher(pvID, { display_id: pvSecondaryID, revised_code: revisedCode, status: IN_REVIEW, balance_owing: `${total_payable - paid_amount_number}` }, user!, SUBMIT_ACTION, () => {
            onSuccess();
          }, () => {
          })
        }, () => {
        });
      }
    }
  );
}

export const updateSparesPurchaseVoucher = (docID: string | undefined, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error) => void) => {
  sparesPurchaseVoucherRef.doc(docID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(SPARES_PURCHASE_VOUCHERS, docID!, log_action, user!, () => {

          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateSparesPurchaseVoucher: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const approveSparesPurchaseVoucher = (docID: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  sparesPurchaseVoucherRef.doc(docID)
    .set({ status: APPROVED }, { merge: true })
    .then(
      () => {
        addLog(SPARES_PURCHASE_VOUCHERS, docID!, APPROVE_ACTION, user!, () => {

          onSuccess();
        }, (error) => {
          onError(`Something went wrong in approveSparesPurchaseVoucher: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const rejectSparesPurchaseVoucher = (docID: string | undefined, rejectNotes: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {
  sparesPurchaseVoucherRef.doc(docID)
    .set({ status: REJECTED, reject_notes: rejectNotes }, { merge: true })
    .then(
      () => {
        addLog(SPARES_PURCHASE_VOUCHERS, docID!, REJECT_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in approveSparesPurchaseVoucher: ${error}`);
        });

      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}