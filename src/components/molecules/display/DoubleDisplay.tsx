import React from 'react';
import { View } from 'react-native';
import TextLabel from '../../atoms/typography/TextLabel';
import TextInputField from '../../atoms/input/text/TextInputField';
import { useTailwind } from 'tailwind-rn/dist';

interface InputProps {
  label: string;
  amount: string;
  unit: string;
}

const DoubleDisplay: React.FC<InputProps> = ({
  label, amount, unit
}) => {
  const tailwind = useTailwind();

  return (
    <View>
      <TextLabel content={label} style={tailwind("font-bold mr-1 mb-2 text-gray-primary")} />
      <View style={tailwind("flex-row w-full")} >
        <View style={tailwind("w-[48%] mr-3")}>
          <TextInputField onChangeText={() => null} placeholder={amount} editable={false} shadow={true} />
        </View>
        <View style={tailwind("w-[48%]")} >
          <TextInputField onChangeText={() => null} placeholder={unit} editable={false} shadow={true} />
        </View>
      </View>
    </View>
  )
}

export default DoubleDisplay;