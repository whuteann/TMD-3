
import { portRef } from "../functions/Firebase";
import { Port } from "../types/Port";
import Validate from "validate.js";
import moment from 'moment';
import { addLog } from "./LogServices";
import { PORTS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createPort = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  getPortDetailByName(name, (port: Port) => {
    onError('Customer name already exist');
  }, (error) => {
    portRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(PORTS, docRef.id, CREATE_ACTION, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createPort: ${error}`);
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

export const updatePort = (id: string, existingName: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    name
  } = data;

  if (existingName == name) {
    portRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          addLog(PORTS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updatePort: ${error}`);
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
  getPortDetailByName(name, (port: Port) => {
    onError('Port name already exist');
  }, (error) => {
    portRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(PORTS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updatePort: ${error}`);
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

export const getPortDetail = (id: string, onSuccess: (port: Port) => void, onError: (error?: string) => void) => {
  portRef.doc(id)
    .onSnapshot((snapshot) => {
      if (Validate.isEmpty(snapshot) || !snapshot?.exists) {
        onError();
        return;
      }

      let port: Port = {
        id: id,
        ...snapshot.data()
      } as Port;

      return onSuccess(port);
    });
}

export const getPortDetailByName = (name: string, onSuccess: (port: Port) => void, onError: (error?: string) => void) => {
  portRef.where('name', '==', name)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let port!: Port;

      snapshot.forEach((doc) => {
        port = {
          id: doc.id,
          ...doc.data()
        } as Port;
      })

      if (!port) {
        onError();
        return;
      }

      return onSuccess(port);
    });
}

export const deletePort = (id: string, user:any, onSuccess: (message: string) => void, onError: (error: string) => void) => {
  portRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() => {
      addLog(PORTS, id, DELETE_ACTION, user!, () => {
        onSuccess('Successfully delete.');
      }, (err) => {
        onError(err)
      })
    })
    .catch((err) => {
      onError(err.message);
    });
}

