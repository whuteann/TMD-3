import { Action, CREATE_ACTION, SUBMIT_ACTION, UPDATE_ACTION } from "../constants/Action";
import { RECEIPTS } from "../constants/Firebase";
import { receiptRef } from "../functions/Firebase";
import { INVOICE_CODE, RECEIPT_CODE } from "../types/Common";
import { Receipt } from "../types/Receipt";
import { getInvoiceData, updateInvoice } from "./InvoiceServices";
import { addLog } from "./LogServices";

const to_replace_string = INVOICE_CODE;
const replace_string = RECEIPT_CODE;
const current_time = new Date();

export const createReceipt = (data: Receipt | any, user: any, onSuccess: (id) => void, onError: (error: any) => void) => {

  getInvoiceData(
    data.invoice_id,
    (invData) => {

      let receiptID: string;
      //if have receipts
      if (invData.receipts) {
        receiptID = `${invData.secondary_id.replace(to_replace_string, replace_string)}-${invData.receipts.length + 1}`

        receiptRef
          .add({ ...data, secondary_id: receiptID, display_id: receiptID, created_at: current_time, created_by: user })
          .then(
            (docRef) => {

              addLog(RECEIPTS, docRef.id, CREATE_ACTION, user!, () => {

                onSuccess(docRef.id);
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
      } else {
        receiptID = `${invData.secondary_id.replace(to_replace_string, replace_string)}-1`

        receiptRef
          .add({ ...data, secondary_id: receiptID, created_at: current_time, created_by: user })
          .then(
            (docRef) => {
              addLog(RECEIPTS, docRef.id, CREATE_ACTION, user!, () => {
                onSuccess(docRef.id);
              }, (error) => {
                onError(`Something went wrong in createInvoice: ${error}`);
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


export const updateReceipt = (reID: string, data: Object, user: any, log_action: Action, onSuccess: () => void, onError: (error: any) => void) => {
  receiptRef.doc(reID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(RECEIPTS, reID, log_action, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateInvoice: ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        console.error(error);
      }
    );
}

export const confirmReceipt = (invID: string, receiptID: string, paid_amount: string, receiptSecondaryID: string, revisedCode: string, user: any, onSuccess: () => void, onError: (error: any) => void) => {

  const receipt_no: number = Number(receiptSecondaryID.split("")[receiptSecondaryID.split("").length - 1])

  getInvoiceData(
    invID,
    (invData) => {
      let total_payable: number = Number(invData.total_payable);
      let paid_amount_number: number = Number(paid_amount);

      if (invData.receipts) {

        let newArr: Array<{ id: string, secondary_id: string, paid_amount: string }> = invData.receipts;
        let spliceArr: Array<{ id: string, secondary_id: string, paid_amount: string }> = [...newArr];
        let amount_paid: number = 0;
        const searchIndex = newArr.findIndex((receipt) => receipt.id == receiptID);


        spliceArr.splice(receipt_no - 1, 1);

        spliceArr.map(item => {
          amount_paid = amount_paid + Number(item.paid_amount);
        })

        if (searchIndex.toString() == "-1") {
          newArr.push({ id: receiptID, secondary_id: receiptSecondaryID, paid_amount: paid_amount });

          updateInvoice(invID, { receipts: newArr }, user!, UPDATE_ACTION, () => {
            updateReceipt(receiptID, { display_id: receiptSecondaryID, revised_code: revisedCode, balance_owing: `${total_payable - amount_paid - paid_amount_number}` }, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {
          });

        } else {
          newArr[searchIndex].secondary_id = receiptSecondaryID
          newArr[searchIndex].paid_amount = paid_amount

          updateInvoice(invID, { receipts: newArr }, user!, UPDATE_ACTION, () => {
            updateReceipt(receiptID, { display_id: receiptSecondaryID, revised_code: revisedCode, balance_owing: `${total_payable - amount_paid - paid_amount_number}`}, user!, SUBMIT_ACTION, () => {
              onSuccess();
            }, () => {
            })
          }, () => {

          });
        }
      } else {
        updateInvoice(invID, { receipts: [{ id: receiptID, secondary_id: receiptSecondaryID, paid_amount: paid_amount }] }, user!, UPDATE_ACTION, () => {
          updateReceipt(receiptID, { display_id: receiptSecondaryID, revised_code: revisedCode, balance_owing: `${total_payable - paid_amount_number}` }, user!, SUBMIT_ACTION, () => {
            onSuccess();
          }, () => {
          })
        }, () => {
        });
      }
    }
  );
}