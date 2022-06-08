import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { useTailwind } from "tailwind-rn/dist";
import { UserSelector } from "../../../../redux/reducers/Auth";
import { updateNotification } from "../../../../services/NotificationServices";
import TextLabel from "../../../atoms/typography/TextLabel";

interface CardProps {
  id: string,
  date: string,
  label: string,
  read: boolean,
  created_at: any ,
  operation: () => void,
}

const NotificationCard: React.FC<CardProps> = ({
  id, date, label, read, created_at,operation
}) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);

  const onPress = () => {
    if (!read) {
      let current_time = new Date();
      let expire_time = new Date(current_time.setMinutes(current_time.getMinutes() + 5))

      updateNotification(id, user?.id!, { read: true, expires_at: expire_time }, () => { }, () => { })
    }
    operation();
  }
  console.log(created_at.toDate());

  return (
    <TouchableOpacity style={tailwind("p-5")} onPress={onPress}>
      <View style={tailwind(`${read ? "opacity-30" : ""}`)}>
        <TextLabel content={date} style={tailwind("font-bold")} />
        <TextLabel content={label} />
        <TextLabel content={`${created_at.toDate().getHours() < 10 ? `0${created_at.toDate().getHours()}`: created_at.toDate().getHours()}:${created_at.toDate().getMinutes() < 10 ? `0${created_at.toDate().getMinutes()}` :  created_at.toDate().getMinutes()}`} style={tailwind("text-gray-primary")}/>
        <View style={tailwind('border-b-2 border-black')} />
      </View>
    </TouchableOpacity>
  )
}


export default NotificationCard;


