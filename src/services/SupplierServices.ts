
import { supplierRef } from "../functions/Firebase";
import { contactPerson } from "../types/Supplier";
import Validate from "validate.js";
import moment from 'moment';
import { Supplier } from "../types/Supplier";
import { addLog } from "./LogServices";
import { SUPPLIERS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createSupplier = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  getSupplierDetailByName(name, (supplier: Supplier) => {
    onError('Supplier name already exist');
  }, (error) => {
    supplierRef
      .add({
        ...data,
        ...{
          status: 'Active',
          type: 'Supplier',
          created_at: moment().toDate(),
          deleted: false
        } 

      })
      .then(
        (docRef) => {
          addLog(SUPPLIERS, docRef.id, CREATE_ACTION, user!, () => {
            console.log(`Supplier ${docRef.id} created succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createSupplier: ${error}`);
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

export const updateSupplier = (id: string, existingName: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  if (existingName == name) {
    supplierRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(SUPPLIERS, id, log_action, user!, () => {
            console.log(`Supplier ${id} updated succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateSupplier: ${error}`);
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
  getSupplierDetailByName(name, (supplier: Supplier) => {
    onError('Supplier name already exist');
  }, (error) => {
    supplierRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          onSuccess();
        }
      )
      .catch(
        (error) => {
          onError(error.message);
        }
      );
  });
}

export const getSupplierDetail = (id: string, onSuccess: (supplier: Supplier) => void, onError: (error?: string) => void) => {
  supplierRef.doc(id)
    .onSnapshot((snapshot) => {
      if (Validate.isEmpty(snapshot) || !snapshot?.exists) {
        onError();
        return;
      }

      let supplier: Supplier = {
        id: id,
        ...snapshot.data()
      } as Supplier;

      return onSuccess(supplier);
    });
}

export const getSupplierDetailByName = (name: string, onSuccess: (supplier: Supplier) => void, onError: (error?: string) => void) => {
  supplierRef.where('name', '==', name)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let supplier!: Supplier;

      snapshot.forEach((doc) => {
        supplier = {
          id: doc.id,
          ...doc.data()
        } as Supplier;
      })

      if (!supplier) {
        onError();
        return;
      }

      return onSuccess(supplier);
    });
}

export const updateSupplierStatus = (id: string, status: string, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  supplierRef.doc(id)
    .update({
      status: status
    })
    .then(() => {
      onSuccess('Successfully updated.')
    })
    .catch((err) => {
      onError(err.message);
    });
}

export const updateSupplierContactList = (id: string, contactList: contactPerson[] | undefined, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  supplierRef.doc(id)
    .update({
      contact_persons: contactList
    })
    .then(() => {
      onSuccess('Successfully added.')
    })
    .catch((err) => {
      onError(err.message);
    });
}

export const deleteSupplier = (id: string, user:any, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  supplierRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() => {
      addLog(SUPPLIERS, id, DELETE_ACTION, user!, () => {
        onSuccess('Successfully delete.');
      }, (err) => {
        onError(err)
      })
    })
    .catch((err) => {
      onError(err.message);
    });
}