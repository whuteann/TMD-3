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
  created_at: any,
  operation: () => void,
}

const NotificationCard: React.FC<CardProps> = ({
  id, date, label, read, created_at, operation
}) => {
  const tailwind = useTailwind();
  const user = useSelector(UserSelector);
  const time = `${created_at.toDate().getHours() < 10 ? `0${created_at.toDate().getHours()}` : created_at.toDate().getHours()}:${created_at.toDate().getMinutes() < 10 ? `0${created_at.toDate().getMinutes()}` : created_at.toDate().getMinutes()}`;

  const onPress = () => {
    if (!read) {
      let current_time = new Date();
      let expire_time = new Date(current_time.setMinutes(current_time.getMinutes() + 5))

      updateNotification(id, user?.id!, { read: true, expires_at: expire_time }, () => { }, () => { })
    }
    operation();
  }


  return (
    <TouchableOpacity style={tailwind("px-5 pb-10")} onPress={onPress}>
      <View style={tailwind("flex-row")}>
        <View style={tailwind("w-[7%] pt-[9]")}>
          <View style={tailwind(`h-[8] w-[8] ${read ? "bg-gray-secondary" : "bg-primary"} rounded-full`)} />
        </View>
        <View style={tailwind(`w-[93%]`)}>
          <TextLabel content={label} />
          <TextLabel content={`${date} at ${time}`} style={tailwind("text-gray-primary")} />
        </View>
      </View>
      <View style={tailwind('border-b-2 border-gray-secondary w-full pt-4')} />
    </TouchableOpacity>
  )
}


export default NotificationCard;


