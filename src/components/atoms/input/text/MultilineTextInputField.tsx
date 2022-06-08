import React from 'react';
import { Platform } from 'react-native';
import { View, TextInput } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../typography/TextLabel';

interface inputProps {
  placeholder: string,
  onChangeText?: (text: any) => void,
  editable?: boolean,
  value?: any,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean,
}

const MultilineTextInputField: React.FC<inputProps> = ({
  placeholder,
  onChangeText = () => null,
  editable = true,
  value,
  hasError = false,
  errorMessage = null,
  style,
  shadow = true,
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('w-full mb-5')}>
      <View style={[
        tailwind(`flex flex-row ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} bg-white items-center rounded-md h-24`),
        hasError ? tailwind('border border-red-500') : null,
        style,
      ]}>
        <TextInput
          editable={editable}
          value={value}
          style={[
            tailwind(`w-full bg-white font-sans text-16px py-3 pl-5 pr-2 rounded-md h-24`),
            editable ? tailwind('opacity-100') : tailwind('opacity-40'),
            Platform.OS == 'web' ? tailwind('outline-none') : null,
            { textAlignVertical: 'top' },
            hasError ? tailwind('border-y border-red-500') : null,
            style,
          ]}
          placeholder={placeholder}
          onChangeText={(val) => {
            onChangeText(val);
          }}
          returnKeyType="done"
          returnKeyLabel="done"
          multiline={true}
        />
      </View>

      {
        hasError
          ?
          <TextLabel content={errorMessage ?? ''} color='text-red-500' />
          :
          <></>
      }
    </View>
  )
}

export default MultilineTextInputField;