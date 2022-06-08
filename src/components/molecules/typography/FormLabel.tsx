import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../atoms/typography/TextLabel';

interface Props {
  text: string,
  required?: boolean
  editable?: boolean
}

const FormLabel: React.FC<Props> = ({
  text, required = false, editable = true
}) => {

  const tailwind = useTailwind();

  return (
    <View style={tailwind("flex-row")}>
      <View>
        <TextLabel content={text} style={tailwind(`font-bold mr-1 mb-2 ${editable ? "" : "text-gray-primary"}`)} />
      </View>
      {
        required
          ?
          <TextLabel content={`*`} color='text-red-500' />
          :
          null
      }
    </View>
  );
}

export default FormLabel;