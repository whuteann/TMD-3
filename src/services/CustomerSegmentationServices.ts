import { CREATE_ACTION, DELETE_ACTION, UPDATE_ACTION } from "../constants/Action";
import { CUSTOMER_SEGMENTATIONS } from "../constants/Firebase";
import { customerSegRef } from "../functions/Firebase";
import { User } from "../types/User";
import { addLog } from "./LogServices";

const current = new Date();

export const createCustomerSegmentation = (data: any, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  customerSegRef
    .add({ ...data, created_at: current, deleted: false })
    .then(docRef => {
      addLog(CUSTOMER_SEGMENTATIONS, docRef.id, CREATE_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in createCustomerSegmentation: ${error}`);
      });
    })
    .catch(error => {
      onError(error);
    })
}

export const updateCustomerSegmentation = (id: string, data: any, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  customerSegRef
    .doc(id)
    .update(data, { merge: true })
    .then(() => {
      addLog(CUSTOMER_SEGMENTATIONS, id, UPDATE_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in updateCustomerSegmentation: ${error}`);
      });
    })
    .catch(error => {
      onError(error);
    })
}

export const deleteCustomerSegmentation = (id: string, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  customerSegRef
    .doc(id)
    .update({ deleted_at: current, deleted: true })
    .then(() => {
      addLog(CUSTOMER_SEGMENTATIONS, id, DELETE_ACTION, user!, () => {
        onSuccess();
      }, (error) => {
        onError(`Something went wrong in deleteCustomerSegmentation: ${error}`);
      });
    })
    .catch(error => {
      onError(error);
    })
}