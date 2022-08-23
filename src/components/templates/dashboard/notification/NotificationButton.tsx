import { revalidateCollection, useCollection } from "@nandorojo/swr-firestore";
import React, { useEffect, useState } from "react";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn/dist";
import { BellButtonIcon, BellIcon } from "../../../../../assets/svg/SVG";
import { NOTIFICATIONS, USERS } from "../../../../constants/Firebase";
import { userRef } from "../../../../functions/Firebase";
import { UserSelector } from "../../../../redux/reducers/Auth";
import { Notification } from "../../../../types/Notification";
import NotificationModal from "./NotificationModal";

interface ButtonProps {
  navigation: any,
}

const current_time = new Date();

const getReadNotifications = async (userID: string,) => {
  let notifications = await userRef
    .doc(userID)
    .collection(NOTIFICATIONS)
    .where("read", "==", true)
    .where("expires_at", ">", current_time)
    .get()
    .then(snapshot => {
      let list: Array<any> = [];
      snapshot.forEach((notification) => {
        list.push(notification.data());
      });

      const sortedList = list.sort((a, b) => {
        return b.created_at - a.created_at;
      });

      return sortedList;
    })

  return notifications;
}

const NotificationButton: React.FC<ButtonProps> = ({
  navigation
}) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const [visible, setVisible] = useState(false);
  const [notifications_read, setNotifications_read] = useState<Array<any>>([]);

  let notifications_count: number | undefined = 0;
  let notifications: Array<Notification> = [] as Array<Notification>;
  let notifications_exist: boolean = false;

  const { data: notifications_not_read } = useCollection<Notification>(`${USERS}/${user?.id}/${NOTIFICATIONS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["read", "==", false],
    orderBy: ['created_at', 'desc'],
  }, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  })

  useEffect(() => {
    getReadNotifications(user?.id!).then(notifications => {
      setNotifications_read(notifications);
    })

    revalidateCollection(`${USERS}/${user?.id}/${NOTIFICATIONS}`);
  }, [visible])


  if (notifications_not_read && notifications_read) {
    notifications = notifications_not_read.concat(notifications_read)
  } else if (notifications_not_read) {
    notifications = notifications_not_read;
  } else if (notifications_read) {
    notifications = notifications_read;
  }

  notifications_count = notifications_not_read?.length;

  if (notifications_count == 0) {
    notifications_exist = false;
  }else{
    notifications_exist = true;
  }


  return (
    <View>
      <TouchableOpacity onPress={() => {
        setVisible(!visible);
        if (visible) {
          revalidateCollection(`${USERS}/${user?.id}/${NOTIFICATIONS}`);
        }
      }}>
        {
          Platform.OS == "web"
            ?
            <View>
              {
                notifications_exist
                  ?
                  <View style={tailwind("rounded-full bg-red-500 z-30 w-[11px] h-[11px] absolute top-[2px] left-[22px]")} />
                  :
                  <></>
              }
              <BellButtonIcon height={35} width={35} />
            </View>
            :
            <View>
              {
                notifications_exist
                  ?
                  <View style={tailwind("rounded-full bg-red-500 z-30 w-[8px] h-[8px] absolute left-[14px]")} />
                  :
                  <></>
              }
              <Image
                source={require("../../../../../assets/icons/BellButton.png")}
                //  source={require("../../../assets/images/catto.jpg")} 
                style={{ height: 23, width: 20 }}
              />
            </View>
        }

      </TouchableOpacity>

      <NotificationModal visible={visible} onClose={() => { setVisible(false) }} notifications={notifications} read_count={notifications_count || 0} navigation={navigation} />
    </View>
  )
}


export default NotificationButton;


