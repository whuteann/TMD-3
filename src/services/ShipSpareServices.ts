import { shipSpareRef } from "../functions/Firebase";
import Validate from "validate.js";
import moment from "moment";
import { ShipSpare } from "../types/ShipSpare";
import { addLog } from "./LogServices";
import { SHIP_SPARES } from "../constants/Firebase";
import { Action, CREATE_ACTION, DELETE_ACTION } from "../constants/Action";

export const createShipSpare = async (data: any, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  let {
    product_code
  } = data;

  getShipSpareByCode(product_code, (shipSpare: ShipSpare) => {
    onError('Product code already exist');
  }, (error) => {
    shipSpareRef
      .add({
        ...data,
        created_at: moment().toDate(),
        deleted: false
      })
      .then(
        (docRef) => {
          addLog(SHIP_SPARES, docRef.id, CREATE_ACTION, user!, () => {
            console.log(`Ship spares ${docRef.id} created succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in createShipSpares: ${error}`);
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

export const updateShipSpare = (id: string, existingCode: string, data: any, user: any, log_action: Action, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    product_code
  } = data;

  if (existingCode == product_code) {
    console.log(id);
    shipSpareRef.doc(id)
      .update({
        ...data
      })
      .then(
        (docRef) => {
          console.log("helloe");
          addLog(SHIP_SPARES, id, log_action, user!, () => {
            console.log(`Ship spares ${id} updated succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateShipSpares: ${error}`);
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
  getShipSpareByCode(product_code, (shipSpare: ShipSpare) => {
    onError('Product code already exist');
  }, (error) => {
    shipSpareRef.doc(id)
      .update({
        ...data,
      })
      .then(
        (docRef) => {
          addLog(SHIP_SPARES, id, log_action, user!, () => {
            console.log(`Ship spares ${id} updated succesfully`);
            onSuccess();
          }, (error) => {
            onError(`Something went wrong in updateShipSpares: ${error}`);
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

export const getShipSpareByCode = (code: string, onSuccess: (shipSpare: ShipSpare) => void, onError: (error?: string) => void) => {
  shipSpareRef.where('product_code', '==', code)
    .get()
    .then((snapshot) => {
      if (Validate.isEmpty(snapshot)) {
        onError('Empty');
        return;
      }

      let shipSpare!: ShipSpare;

      snapshot.forEach((doc) => {
        shipSpare = {
          id: doc.id,
          ...doc.data()
        } as ShipSpare;
      })

      if (!shipSpare) {
        onError('Empty');
        return;
      }

      return onSuccess(shipSpare);
    });
}

export const deleteShipSpare = (id: string, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  shipSpareRef.doc(id)
    .update({
      deleted: true,
      deleted_at: moment().toDate()
    })
    .then(() =>
      addLog(SHIP_SPARES, id, DELETE_ACTION, user!, () => {
        onSuccess();
      }, (err) => {
        onError(err)
      })
    )
    .catch((error) => onError(error.message));
}