import { JobConfirmation } from "../types/JobConfirmation";
import { SalesConfirmation } from "../types/SalesConfirmation";
import { jobConfirmationRef } from "../functions/Firebase";
import { DATE, JOB_CONFIRMATION_CODE, SALES_CODE } from "../types/Common";
import { addLog } from "./LogServices";
import { JOB_CONFIRMATIONS } from "../constants/Firebase";
import { CREATE_ACTION, UPDATE_ACTION } from "../constants/Action";
import { emailToAccountAssistants } from "./SalesConfirmationServices";

const to_replace_string = SALES_CODE;
const current_time = new Date();

const generateJobID = (salesID: string, customerName: string) => {
  const code = salesID.replace(to_replace_string, "").replace(DATE, "");
  const customer_code: string = customerName.split(" ")
    .map(item => {
      if (item[0].match(/^[A-Za-z]+$/)) {
        return item[0].toUpperCase();
      }
    })
    .join("");

  let jobID = `${JOB_CONFIRMATION_CODE} / ${customer_code} / ${code} / ${(current_time.getMonth() + 1) > 9 ? `${current_time.getMonth() + 1}` : `0${current_time.getMonth() + 1}`}${`${current_time.getFullYear()}`.slice(2)}`

  return jobID;
}

export const createJobConfirmation = (salesConfirmation: SalesConfirmation, user: any, onSuccess: ({ id, displayID }) => void, onError: (error) => void) => {
  let jobID = generateJobID(salesConfirmation.secondary_id, salesConfirmation.customer.name);

  const newJobConfirmation: JobConfirmation | any = {
    secondary_id: jobID,
    quotation_id: salesConfirmation.quotation_id,
    quotation_secondary_id: salesConfirmation.quotation_secondary_id,
    confirmed_date: salesConfirmation.confirmed_date,
    products: salesConfirmation.products,
    payment_term: salesConfirmation.payment_term,
    customer: salesConfirmation.customer,
    bunker_barges: salesConfirmation.bunker_barges,
    port: salesConfirmation.port,

    barging_fee: salesConfirmation.barging_fee,
    barging_remark: salesConfirmation.barging_remark,
    barging_unit: salesConfirmation.barging_unit,

    delivery_mode: salesConfirmation.delivery_mode,
    currency_rate: salesConfirmation.currency_rate,
    delivery_location: salesConfirmation.delivery_location,
    delivery_date: salesConfirmation.delivery_date,
    remarks: salesConfirmation.remarks,
    remarks_OT: salesConfirmation.remarks_OT,
    conditions: salesConfirmation.conditions,
    surveyor_contact_person: salesConfirmation.surveyor_contact_person,
    receiving_vessel_name: salesConfirmation.receiving_vessel_name,
    receiving_vessel_contact_person: salesConfirmation.receiving_vessel_contact_person,

    purchase_order_no: salesConfirmation.purchase_order_no || "",
    purchase_order_file: salesConfirmation.purchase_order_file || "",
    filename_storage_po: salesConfirmation.filename_storage || "",
    sales_confirmation_secondary_id: salesConfirmation.secondary_id,

    status: "No Invoice",
    created_at: current_time,
    created_by: user,
    sales_id: salesConfirmation.sales_id
  }


  jobConfirmationRef
    .add(newJobConfirmation)
    .then(
      (docRef) => {
        addLog(JOB_CONFIRMATIONS, docRef.id, CREATE_ACTION, user!, () => {
          onSuccess({ id: docRef.id, displayID: jobID });
        }, (error) => {
          onError(`Something went wrong in recreateSalesConfirmation ${error}`);
        });

        emailToAccountAssistants(docRef.id);
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const recreateJobConfirmation = (jobID: string, salesConfirmation: SalesConfirmation, user: any, onSuccess: (displayID) => void, onError: (error) => void ) =>{
  let displayID = generateJobID(salesConfirmation.secondary_id, salesConfirmation.customer.name);

  const updatedJobConfirmation: JobConfirmation | any = {
    quotation_id: salesConfirmation.quotation_id,
    quotation_secondary_id: salesConfirmation.quotation_secondary_id,
    confirmed_date: salesConfirmation.confirmed_date,
    products: salesConfirmation.products,
    payment_term: salesConfirmation.payment_term,
    customer: salesConfirmation.customer,
    bunker_barges: salesConfirmation.bunker_barges,
    port: salesConfirmation.port,

    barging_fee: salesConfirmation.barging_fee,
    barging_remark: salesConfirmation.barging_remark,
    barging_unit: salesConfirmation.barging_unit,
    
    delivery_mode: salesConfirmation.delivery_mode,
    currency_rate: salesConfirmation.currency_rate,
    delivery_location: salesConfirmation.delivery_location,
    delivery_date: salesConfirmation.delivery_date,
    remarks: salesConfirmation.remarks,
    remarks_OT: salesConfirmation.remarks_OT,
    conditions: salesConfirmation.conditions,
    surveyor_contact_person: salesConfirmation.surveyor_contact_person,
    receiving_vessel_name: salesConfirmation.receiving_vessel_name,
    receiving_vessel_contact_person: salesConfirmation.receiving_vessel_contact_person,

    purchase_order_no: salesConfirmation.purchase_order_no || "",
    purchase_order_file: salesConfirmation.purchase_order_file || "",
    filename_storage_po: salesConfirmation.filename_storage || "",
    sales_confirmation_secondary_id: salesConfirmation.secondary_id,

    status: "No Invoice",
    created_at: current_time,
    created_by: user,
    sales_id: salesConfirmation.sales_id
  }

  jobConfirmationRef.doc(jobID)
    .set(updatedJobConfirmation, { merge: true })
    .then(
      () => {
        addLog(JOB_CONFIRMATIONS, jobID!, UPDATE_ACTION, user!, () => {
          onSuccess(displayID);
        }, (error) => {
          onError(`Something went wrong in recreateJobConfirmation ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}

export const updateJobConfirmation = (jobID: string | undefined, data: Object, user: any, onSuccess: () => void, onError: (error) => void) => {
  jobConfirmationRef.doc(jobID)
    .set(data, { merge: true })
    .then(
      () => {
        addLog(JOB_CONFIRMATIONS, jobID!, UPDATE_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in updateJobConfirmation ${error}`);
        });
      }
    )
    .catch(
      (error) => {
        onError(error);
      }
    );
}