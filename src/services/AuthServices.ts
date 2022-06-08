import { auth } from "../functions/Firebase";
import { User } from "../types/User";
import firebase from "firebase/app";

export const login = (email, password, onSuccess: (user: User) => void, onError: (error: string) => void) => {
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredentials => {
      const user = userCredentials.user;

      let userData = {
        id: user?.uid!,
        email: user?.email!,
        name: user?.displayName!,
        avatar: user?.photoURL!,
      }

      onSuccess(userData);
    })
    .catch(error => {
      onError(error.message);
    }
  )
}

export const reauthenticateUser = (currentPassword) => {
  var user = auth.currentUser;
  var cred = firebase.auth.EmailAuthProvider.credential(user?.email || "", currentPassword);
  return user?.reauthenticateWithCredential(cred);
}