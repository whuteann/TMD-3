import React, { useState } from 'react';
import { View } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useTailwind } from 'tailwind-rn/dist';
import tailwindConfig from '../../../../../tailwind.config';
import TextLabel from '../../typography/TextLabel';

interface checkboxProps {
  title: string,
  onChecked: (checked: boolean) => void,
  checked?: boolean,
  disabled?: boolean,
  hasError?: boolean,
  errorMessage?: string
  style?: string
}

const Checkbox: React.FC<checkboxProps> = ({
  title,
  onChecked,
  checked = false,
  disabled = false,
  hasError = false,
  errorMessage = null,
  style = ""
}) => {
  const tailwind = useTailwind();
  const [isChecked, setCheckedState] = useState(checked);

  const toggleChecked = () => {
    setCheckedState(!isChecked);
    onChecked(!isChecked);
  }

  return (
    <View style={[tailwind('w-full mb-5'), tailwind(style)]}>
      <CheckBox
        activeOpacity={1}
        disabled={disabled}
        title={title}
        containerStyle={tailwind('border-0 bg-transparent m-0 p-0')}
        textStyle={tailwind('font-normal text-14px mb-1 ml-1')}
        checked={isChecked}
        onPress={() => toggleChecked()}
        checkedColor={tailwindConfig.theme.extend.colors.primary}
      />

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

export default Checkbox;