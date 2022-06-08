import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import TextLabel from "../../atoms/typography/TextLabel";

interface ViewTabDropdownProps {
  icon: any,
  text: string,
  navigation: () => void,
  setDropdown: () => void,
}


const ViewTabDropdown: React.FC<ViewTabDropdownProps> = ({
  icon, text, navigation, setDropdown
}) => {

  const onPressTab = () => {
    navigation();
    setDropdown();
  }
  const tailwind = useTailwind();

  return (
    <TouchableOpacity onPress={onPressTab}>
      <View style={tailwind("flex-row items-center mb-2")}>
        <View style={tailwind("mr-2")} >
          {icon}
        </View>
        <TextLabel content={text} style={tailwind("text-14px")} />
      </View>
    </TouchableOpacity>
  )
}

export default ViewTabDropdown;