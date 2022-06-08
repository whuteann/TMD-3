import React from 'react';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';

interface Props {
  left?: any,
  right?: any,
}

const FormDouble: React.FC<Props> = ({
  left = null, right = null
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind("flex flex-row justify-between")}>
      <View style={tailwind("w-6/12")}>
        <View style={tailwind("flex-grow mr-2")}>
          {left}
        </View>
      </View>
      <View style={tailwind("w-6/12")}>
        <View style={tailwind("flex-grow")}>
          {right}
        </View>
      </View>
    </View>
  );
}

export default FormDouble;