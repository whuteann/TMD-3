import moment from "moment";
import Validate from "validate.js";
import { CREATE_ACTION, DELETE_ACTION, UPDATE_ACTION } from "../constants/Action";
import { USERS } from "../constants/Firebase";
import { functions, userRef } from "../functions/Firebase";
import { getRolePermission } from "../helpers/GenericHelper";
import { User } from "../types/User";
import { addLog } from "./LogServices";

export const getUserDetail = (id: string, onSuccess: (user: User) => void, onError: (error?: string) => void) => {
  userRef.doc(id)
    .onSnapshot((snapshot) => {
      if (Validate.isEmpty(snapshot) || !snapshot?.exists) {
        onError();
        return;
      }

      let user: User = {
        id: id,
        ...snapshot.data()
      } as User;

      return onSuccess(user);
    });
}

export const createUser = (data: any, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    role
  } = data;

  const createUserFunc = functions.httpsCallable('createUser');

  data = {
    ...data,
    permission: getRolePermission(role)
  }

  createUserFunc(data)
    .then((result) => {
      let userRecord = result.data;

      addLog(USERS, userRecord.uid, CREATE_ACTION, user, () => {
        onSuccess();
      }, (err) => {
        onError(err);
      });
    })
    .catch((err) => {
      onError(err.message);
    });
}

export const updateUser = (id: string, data: any, user: User, onSuccess: () => void, onError: (error: string) => void) => {
  const {
    role,
  } = data;

  const updateUserFunc = functions.httpsCallable('updateUser');

  data = {
    id: id,
    ...data,
    permission: getRolePermission(role)
  }

  updateUserFunc(data)
    .then((result) => {
      addLog(USERS, id, UPDATE_ACTION, user, () => {
        onSuccess();
      }, (err) => {
        onError(err);
      });

      onSuccess();
    })
    .catch((err) => {
      onError(err.message);
    });
}

export const deleteUser = (id: string, user: any, onSuccess: () => void, onError: (error: string) => void) => {
  const deleteUser = functions.httpsCallable('deleteUser');
  let data = {
    id: id
  }

  deleteUser(data)
    .then((result) => {
      addLog(USERS, id, DELETE_ACTION, user!, () => {
        onSuccess();
      }, (err) => {
        onError(err)
      })
    })
    .catch((err) => {
      onError(err.message);
    });
  // userRef
  //   .doc(id).set(
  //     {
  //       deleted: true,
  //       deleted_at: new Date
  //     }, { merge: true }
  //   ).then(() => {
  //     onSuccess()
  //   }).catch(err => {
  //     onError(err);
  //   })

}

export const resendVerification = (user: User, onSuccess: () => void, onError: (error: string) => void) => {
  const resendVerification = functions.httpsCallable('resendVerification');
  let data = {
    email: user?.email
  }

  resendVerification(data)
    .then((result) => {
      onSuccess();
    })
    .catch((err) => {
      onError(err.message);
    });
}

export const addQuotationCount = (id: string) => {
  userRef.doc(id).get().then(user => {

    if (user.data()?.quotation_count) {
      userRef.doc(id).update({ quotation_count: user.data()?.quotation_count + 1 })
    } else {
      userRef.doc(id).update({ quotation_count: 1 })
    }
  })
}
