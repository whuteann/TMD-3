import React from 'react';
import { Platform, View, TextInput } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { MagnifierIcon } from '../../../../../assets/svg/SVG';

interface inputProps {
  placeholder: string,
  onChangeText?: (text: any) => void,
  editable?: boolean,
  value?: any,
  style?: any,
  shadow?: boolean,
}

const SearchBar: React.FC<inputProps> = ({
  placeholder,
  onChangeText = () => null,
  editable = true,
  value,
  style,
  shadow = true,
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('w-full mb-5')}>
      <View style={[
        tailwind(`flex flex-row ${ shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary' } bg-white items-center rounded-md pl-3`),
        style,
      ]}>

        <MagnifierIcon height={20} width={20} />

        <TextInput
          editable={editable}
          value={value}
          style={[
            tailwind(`w-full font-sans text-14px py-3 px-2 rounded-r-md`),
            editable ? tailwind('opacity-100') : tailwind('opacity-20'),
            Platform.OS == 'web' ? tailwind('outline-none') : null
          ]}
          placeholder={placeholder}
          onChangeText={(val) => { onChangeText(val); }}
          returnKeyType="done"
          returnKeyLabel="done"
        />
      </View>
    </View>
  );
}

export default SearchBar;