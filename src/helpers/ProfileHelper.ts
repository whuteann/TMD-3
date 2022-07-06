import { auth, userRef } from "../functions/Firebase";
import { reauthenticateUser } from "../services/AuthServices";


export const submitProfile = (values, currentPassword, onSuccess: () => void, onError: (errorMessage?: string) => void) => {

  if (values.password !== "") {
    reauthenticateUser(currentPassword)?.
      then(
        data => {
          const saveData = {
            contacts: values.contacts,
          }

          if (typeof (auth.currentUser?.uid) != "undefined") {
            let user = userRef.doc(auth.currentUser.uid)
            auth.currentUser.updatePassword(values.password).then(() => { }).catch(error => console.error(error));
            user.update(saveData).then(
              () => {
                onSuccess();
              }
            );
          }

        }
      )
      .catch(
        err => {
          onError(err.message);
        }
      );


  } else {
    const saveData = {
      contacts: values.contacts,
    }

    if (typeof (auth.currentUser?.uid) != "undefined") {
      let user = userRef.doc(auth.currentUser.uid)
      user.update(saveData).then(
        () => {
          onSuccess()
        }
      ).catch(error => console.error(error));
    }
  }
}

