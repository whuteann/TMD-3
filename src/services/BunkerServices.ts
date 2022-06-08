import { bunkerRef } from "../functions/Firebase";
import Validate from "validate.js";
import { Bunker } from "../types/Bunker";
import moment from "moment";
import { addLog } from "./LogServices";
import { BUNKERS } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createBunker = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  let {
    official_number
  } = data;

  getBunkerByOfficialNumber(official_number, (bunker: Bunker) => {
    onError('Official No already exist');
  }, (error) => {
    bunkerRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(BUNKERS, docRef.id, CREATE_ACTION, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createBunker: ${error}`);
          });

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

export const updateBunker = (id: string, existingOfficialNumber: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    official_number
  } = data;

  if (existingOfficialNumber == official_number) {
    bunkerRef.doc(id)
      .update({
        ...data,
        created_at: moment().toDate()
      })
      .then(
        (docRef) => {
          addLog(BUNKERS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateBunker: ${error}`);
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
  getBunkerByOfficialNumber(official_number, (bunker: Bunker) => {
    onError('Official No already exist');
  }, (error) => {
    bunkerRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(BUNKERS, id, log_action, user!, () => {
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateBunker: ${error}`);
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

export const getBunkerByOfficialNumber = (officialNumber: string, onSuccess: (bunker: Bunker) => void, onError: (error?: string) => void) => {
  bunkerRef.where('official_number', '==', officialNumber)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let bunker!: Bunker;

      snapshot.forEach((doc) => {
        bunker = {
          id: doc.id,
          ...doc.data()
        } as Bunker;
      })

      if (!bunker) {
        onError('Empty');
        return;
      }

      return onSuccess(bunker);
    });
}

export const deleteBunker = (id: string, user:any, onSuccess: () => void, onError: (error: string) => void) => {
  bunkerRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() => 
    addLog(BUNKERS, id, DELETE_ACTION, user!, () => {
      onSuccess()
    }, (err) => {
      onError(err)
    })
    )
    .catch((error) => onError(error.message));
}