import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../../atoms/typography/TextLabel';

interface InfoProps {
  index: number,
  port: string,
  delivery_location: string,

}

const PortRadioButton: React.FC<InfoProps> = ({
  index, port, delivery_location
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("w-full")}>
      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Port ${index + 1}`} style={tailwind("font-bold")} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' style={tailwind("font-bold")} />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <TextLabel content={`${port}`} style={tailwind("font-bold")} />
        </View>
      </View>

      <View style={tailwind("flex-row ml-4 w-full mb-1")}>
        <View style={tailwind("w-[39.5%]")}>
          <TextLabel content={`Delivery Location`} />
        </View>
        <View style={tailwind("")}>
          <TextLabel content=':' />
        </View>
        <View style={tailwind("ml-2 w-[50%]")}>
          <TextLabel content={`${delivery_location}`} />
        </View>
      </View>
    </View>
  )
}

export default PortRadioButton;