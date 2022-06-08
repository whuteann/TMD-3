import { auth, userRef } from "../functions/Firebase";
import { reauthenticateUser } from "../services/AuthServices";


export const submitProfile = (values, currentPassword, onSuccess: () => void, onError: (errorMessage?: string) => void) => {

  if (values.password !== "") {
    console.log("updating password");
    reauthenticateUser(currentPassword)?.
      then(
        data => {
          console.log(data)
          const saveData = {
            contacts: values.contacts,
          }

          if (typeof (auth.currentUser?.uid) != "undefined") {
            let user = userRef.doc(auth.currentUser.uid)
            auth.currentUser.updatePassword(values.password).then(() => { console.log("password updated") }).catch(error => console.error(error));
            user.update(saveData).then(
              () => {
                console.log("Updated successfullly");
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
          console.log("Updated successfullly");
          onSuccess()
        }
      ).catch(error => console.log(error));
    }
  }
}

