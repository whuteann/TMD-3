
import { firestore } from "../functions/Firebase";
import moment from 'moment';
import { LOGS } from "../constants/Firebase";
import { Log } from "../types/Log";
import { User } from "../types/User";
import { Action } from "../constants/Action";

export const addLog = async (collectionName: string, documentId: string, action: Action, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  let currentData = await firestore.collection(collectionName)
    .doc(documentId)
    .get()
    .then((doc) => {
      return doc.data();
    });

  let log: Log = {
    action: action,
    action_by: user!,
    data: currentData,
    created_at: moment().toDate()
  }

  firestore.collection(collectionName)
    .doc(documentId)
    .collection(LOGS)
    .add(log)
    .then(function () {
      return onSuccess();
    })
    .catch(function (error) {
      return onError(error);
    });
}

export const getLogs = (collectionName: string, documentId: string, onSuccess: (logs: Array<Log>) => void, onError: (error?: string) => void) => {
  let logs: Array<Log> = [];

  firestore.collection(collectionName)
    .doc(documentId)
    .collection(LOGS)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let log: Log = {
          id: doc.id,
          ...doc.data()
        } as Log;

        logs.push(log)
      })

      return onSuccess(logs);
    })
    .catch(function (error) {
      return onError(error);
    });
}