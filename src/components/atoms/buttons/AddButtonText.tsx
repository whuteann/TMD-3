import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PlusIcon } from '../../../../assets/svg/SVG';
import { useTailwind } from 'tailwind-rn/dist';

interface inputProps {
  text: string,
  onPress: () => void,
}

const AddButtonText: React.FC<inputProps> = ({
  text, onPress
}) => {
  const tailwind = useTailwind();
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={tailwind("flex-row items-center justify-start")}>
        <PlusIcon height={20} width={20} />
        <View>
          <Text style={tailwind("text-16px font-sans ml-4")}>{text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default AddButtonText;