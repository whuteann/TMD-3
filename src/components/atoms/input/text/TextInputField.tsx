import React, { useState } from 'react';
import { Platform } from 'react-native';
import { View, TextInput } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useTailwind } from 'tailwind-rn/dist';
import { EyeIcon, EyeSlashIcon } from '../../../../../assets/svg/SVG';
import TextLabel from '../../typography/TextLabel';

interface inputProps {
  placeholder: string,
  onChangeText?: (text: any) => void,
  icon?: any,
  editable?: boolean,
  value?: any,
  password?: boolean,
  number?: boolean,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean,
  margin?: any,
}

const TextInputField: React.FC<inputProps> = ({
  placeholder,
  onChangeText = () => null,
  icon = null,
  editable = true,
  value,
  password = false,
  number = false,
  hasError = false,
  errorMessage = null,
  style,
  shadow = true,
  margin = undefined,
}) => {
  const tailwind = useTailwind();
  const [showPassword, setPasswordState] = useState(password);

  const togglePassword = () => {
    setPasswordState(!showPassword);
  }

  return (

    <View style={[tailwind('w-full mb-5'), margin]}>
      <View style={[
        tailwind(`flex flex-row ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} bg-white items-center rounded-md pl-3`),
        hasError ? tailwind('border border-red-500') : null,
        style,
      ]}>

        {icon}

        <TextInput
          editable={editable}
          value={value}
          style={[
            tailwind(`${password ? 'w-[78%]' : 'w-full'} font-sans text-16px py-3 px-2 rounded-r-md`),
            editable ? tailwind('opacity-100') : tailwind('opacity-50'),
            Platform.OS == 'web' ? tailwind('outline-none') : null
          ]}
          placeholder={placeholder}
          keyboardType={number ? Platform.OS == 'android' ? 'phone-pad' : 'numeric' : undefined}
          onChangeText={(val) => {
            if (number) {
              onChangeText(val.replace(/[^0-9.]/g, ''))
            } else {
              onChangeText(val);
            }
          }}
          secureTextEntry={showPassword}
          returnKeyType="done"
          returnKeyLabel="done"
        />

        {
          password
            ?
            <View style={tailwind('ml-auto pr-2')} >
              <TouchableWithoutFeedback onPress={() => togglePassword()}>
                {
                  showPassword
                    ?
                    <EyeSlashIcon width={30} height={30} />
                    :
                    <EyeIcon width={30} height={30} />
                }
              </TouchableWithoutFeedback>
            </View>
            :
            <></>
        }
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

export default TextInputField;