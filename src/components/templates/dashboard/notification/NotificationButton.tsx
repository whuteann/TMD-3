import { revalidateCollection, useCollection } from "@nandorojo/swr-firestore";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn/dist";
import { BellIcon } from "../../../../../assets/svg/SVG";
import { NOTIFICATIONS, USERS } from "../../../../constants/Firebase";
import { userRef } from "../../../../functions/Firebase";
import { UserSelector } from "../../../../redux/reducers/Auth";
import { Notification } from "../../../../types/Notification";
import TextLabel from "../../../atoms/typography/TextLabel";
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
  let count = (<></>);
  let notifications_count: number | undefined = 0;
  let notifications: Array<Notification> = [] as Array<Notification>;

  const { data: notifications_not_read } = useCollection<Notification>(`${USERS}/${user?.id}/${NOTIFICATIONS}`, {
    ignoreFirestoreDocumentSnapshotField: false,
    where: ["read", "==", false],
    orderBy: ['created_at', 'desc'],
    limit: 50
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

  if (notifications_count) {
    if (notifications_count > 99) {
      count = (
        <View style={tailwind("rounded-full bg-red-500 z-30 w-[23px] h-[23px] absolute top-[5px] left-[17px]")}>
          <TextLabel
            content="99+"
            style={tailwind(`text-white text-12px w-[30px] absolute bottom-[-2px]`)}
          />
        </View>
      )
    } else {
      count = (
        <View style={tailwind("rounded-full bg-red-500 z-30 w-[23px] h-[23px] absolute top-[5px] left-[17px]")}>
          <TextLabel
            content={`${notifications_count}`}
            style={tailwind(`text-white absolute bottom-[-3.5px] ${notifications_count > 9 ? (notifications_count < 20 ? "left-[5px]" : "left-[3.6px]") : "left-[7.5px]"} ${notifications_count == 1 ? "left-[9px]" : ""}`)}
          />
        </View>
      )
    }
  }

  return (
    <View>
      <TouchableOpacity onPress={() => {
        setVisible(!visible);
        if (visible) {
          revalidateCollection(`${USERS}/${user?.id}/${NOTIFICATIONS}`);
        }
      }}>
        {count}
        <BellIcon height={40} width={40} />
      </TouchableOpacity>

      <NotificationModal visible={visible} onClose={() => { setVisible(false) }} notifications={notifications} read_count={notifications_count || 0} navigation={navigation} />
    </View>
  )
}


export default NotificationButton;


