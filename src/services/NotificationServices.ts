import { revalidateCollection } from "@nandorojo/swr-firestore";
import { getExpoPushTokenAsync } from "expo-notifications";
import { NOTIFICATIONS, USERS } from "../constants/Firebase";
import { functions, userRef } from "../functions/Firebase";
import { Notification } from "../types/Notification";
import {applicationId} from "expo-application";

export const registerForPushNotification = async (userID: string) => {

  let token = (await getExpoPushTokenAsync({
    experienceId: '@studio20/TMD',
    development: false,
    applicationId: applicationId || undefined
  })).data;

  userRef.doc(userID).get().then(user => {
    let expoTokens = user.data()!.expoTokens || [];

    expoTokens.push(token)

    userRef.doc(userID).update({
      expoTokens: expoTokens
    })
  })

  return token
}

export const removePushNotification = (userID: string, token: string, onSuccess: () => void, onError: () => void) => {
  userRef.doc(userID).get().then(user => {
    let expoTokens = user.data()!.expoTokens || [];
    const index = expoTokens.indexOf(token);
    if (index > -1) {
      expoTokens.splice(index, 1); // 2nd parameter means remove one item only
    }

    userRef.doc(userID).update({
      expoTokens: expoTokens
    }).then(() => {
      onSuccess();
    })
  })
}

export const getToken = async () => {
  let token;
  token = (await getExpoPushTokenAsync({
    experienceId: '@studio20/TMD',
    development: false,
    applicationId: applicationId || undefined
  })).data;
  return token;
}

const sendBatchPushNotifications = async (roles: Array<string>, message: string) => {
  const pushTokens = await getTokensFromRoles(roles);

  const sendPushNotificationsFunc = functions.httpsCallable('sendBatchPushNotifications');
  const data = {
    pushTokens: pushTokens,
    message: message
  }
  sendPushNotificationsFunc(data).then(val => {
  }).catch(err => {
    console.error(err)
  });

}

const getTokensFromRoles = async (roles: Array<string>) => {
  const tokensList = await userRef.where('role', 'in', roles).get().then(snapshot => {
    let tokens: Array<string> = [];

    snapshot.forEach((doc) => {
      if (doc.data().expoTokens) {
        doc.data().expoTokens.map(token => {
          tokens.push(token);
        })
      }
    });

    return tokens;
  });

  return tokensList;
}

const addNotifications = async (roles: Array<string>, message: string, data: any) => {

  const current_date = new Date();

  let notifications: Notification = {
    created_at: new Date(),
    date: `${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()}`,
    message: message,
    read: false,
    data: data,
  }

  userRef.where("role", "in", roles).get().then(snapshot => {
    snapshot.forEach((user) => {
      userRef.doc(user.id).collection(NOTIFICATIONS).add(notifications).then(docRef => {
        revalidateCollection(`${USERS}/${user.id}/${NOTIFICATIONS}`);
      });

    });
  })

}

export const sendNotifications = async (roles: Array<string>, message: string, data: any | { screen: string, docID: string }) => {
  await sendBatchPushNotifications(roles, message);
  await addNotifications(roles, message, data);
}

export const updateNotification = (id: string, userID: string, data: any, onSuccess: () => void, onError: (error: string) => void) => {
  userRef.doc(userID).collection(NOTIFICATIONS).doc(id).update(data).then(() => {
    onSuccess();
    revalidateCollection(`${USERS}/${userID}/${NOTIFICATIONS}`);
  }).catch(err => {
    onError(err);
  });
}