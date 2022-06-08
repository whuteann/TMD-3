import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';

interface InfoProps {
  index: number,
  delivery_mode: string,
}

const DeliverModeRadioButton: React.FC<InfoProps> = ({
  index, delivery_mode
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Delivery mode ${index + 1}`} style={tailwind("font-bold")} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' style={tailwind("font-bold")} />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <TextLabel content={`${delivery_mode}`} style={tailwind("font-bold")} />
        </View>
      </View>
    </View>
  )
}

export default DeliverModeRadioButton;