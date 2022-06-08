
import { customerRef } from "../functions/Firebase";
import { contactPerson, Customer } from "../types/Customer";
import Validate from "validate.js";
import moment from 'moment';
import { useCollection } from "@nandorojo/swr-firestore";
import { User } from "../types/User";
import { addLog } from "./LogServices";
import { CUSTOMERS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION, UPDATE_ACTION } from "../constants/Action";

export const createCustomer = async (data: any, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  getCustomerDetailByName(name, (customer: Customer) => {
    onError('Customer name already exist');
  }, (error) => {
    customerRef
      .add({
        ...data,
        ...{
          status: 'Active',
          type: 'Customer',
          created_at: moment().toDate(),
          deleted: false
        } 
      })
      .then((docRef) => {
        addLog(CUSTOMERS, docRef.id, CREATE_ACTION, user!, () => {
          onSuccess();
        }, (error) => {
          onError(`Something went wrong in createBunker: ${error}`);
        });

      })
      .catch((error) => {
        onError(error.message);
      });
  });
}

export const updateCustomer = (id: string, existingName: string, data: any, user: User, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  if (existingName == name) {
    customerRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(CUSTOMERS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateCustomer: ${error}`);
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
  getCustomerDetailByName(name, (customer: Customer) => {
    onError('Customer name already exist');
  }, (error) => {
    customerRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(CUSTOMERS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateCustomer: ${error}`);
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

export const getCustomerDetail = (id: string, onSuccess: (customer: Customer) => void, onError: (error?: string) => void) => {
  customerRef.doc(id)
    .onSnapshot((snapshot) => {
      if (Validate.isEmpty(snapshot) || !snapshot?.exists) {
        onError();
        return;
      }

      let customer: Customer = {
        id: id,
        ...snapshot.data()
      } as Customer;

      return onSuccess(customer);
    });
}

export const getCustomerDetailByName = (name: string, onSuccess: (customer: Customer) => void, onError: (error?: string) => void) => {
  customerRef.where('name', '==', name)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let customer!: Customer;

      snapshot.forEach((doc) => {
        customer = {
          id: doc.id,
          ...doc.data()
        } as Customer;
      })

      if (!customer) {
        onError();
        return;
      }

      return onSuccess(customer);
    });
}

export const updateCustomerStatus = (id: string, status: string, user: User, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  customerRef.doc(id)
    .update({
      status: status
    })
    .then(() => {
      addLog(CUSTOMERS, id, UPDATE_ACTION, user!, () => {
        onSuccess('Successfully updated.')
      }, (error) => {
        onError(`Something went wrong in updateCustomerStatus: ${error}`);
      });

    })
    .catch((err) => {
      onError(err.message);
    });
}

export const updateCustomerContactList = (id: string, contactList: contactPerson[] | undefined, user: User, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  customerRef.doc(id)
    .update({
      contact_persons: contactList
    })
    .then(() => {
      addLog(CUSTOMERS, id, UPDATE_ACTION, user!, () => {
        onSuccess('Successfully added.')
      }, (error) => {
        onError(`Something went wrong in updateCustomerStatus: ${error}`);
      });

    })
    .catch((err) => {
      onError(err.message);
    });
}

export const deleteCustomer = (id: string, user:any, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  customerRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() => {
      addLog(CUSTOMERS, id, DELETE_ACTION, user!, () => {
        onSuccess('Successfully delete.');
      }, (err) => {
        onError(err)
      })
    })
    .catch((err) => {
      onError(err.message);
    });
}


