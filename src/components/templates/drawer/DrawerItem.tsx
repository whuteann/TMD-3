import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import { OrderSettingsIcon, ProfileIcon, SettingsEyeIcon } from "../../../../assets/svg/SVG";
import TextLabel from "../../atoms/typography/TextLabel";


interface DrawerItemProps {
  icon: any,
  text: string,
  onPress: () => void,
}


const DrawerItem: React.FC<DrawerItemProps> = ({
  icon, text, onPress
}) => {

  const tailwind = useTailwind();
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={tailwind("flex-row items-center mb-2")}>
        <View style={tailwind("mr-5")}>
          {icon}

        </View>
        <View style={tailwind("flex-wrap w-[75%]")}>
          <TextLabel content={text} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default DrawerItem; 