import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import TextLabel from "../../atoms/typography/TextLabel";

interface LabelProps {
  label: string,
  quantity: number,
  color: string
}

const ChartLabel: React.FC<LabelProps> = ({
  quantity, label, color
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("flex-row items-center")}>
      <View  style={{ width: 15, height: 15, borderRadius: 10, backgroundColor: color }} />
      <View style={tailwind("ml-5")}>
        <View>
          <TextLabel content={`${quantity} ${label}`}/>
        </View>
      </View>
    </View>
  )
}

export default ChartLabel;