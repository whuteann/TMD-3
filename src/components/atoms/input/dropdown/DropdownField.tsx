import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../typography/TextLabel';
import { ValueType } from 'react-native-dropdown-picker';
import RNPickerSelect from 'react-native-picker-select';
import { ArrowDownIcon } from '../../../../../assets/svg/SVG';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface inputProps {
  placeholder?: string,
  items: Array<string>
  onChangeValue?: (text: any) => void,
  value?: any,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean,
  editable?: boolean
}

const DropdownField: React.FC<inputProps> = ({
  placeholder = 'Select',
  onChangeValue = () => null,
  value,
  items,
  hasError = false,
  errorMessage = null,
  style,
  shadow = true,
  editable = true,
}) => {
  const tailwind = useTailwind();
  const [dropdownValue, setDropdownValue] = useState<ValueType | null>(value);
  const [dropdownItems, setDropdownItems] = useState([]);

  useEffect(() => {
    let temp = [] as any;

    if(items != undefined) {
      items.map((item) => {
        temp.push({ label: item, value: item })
      })
    }

    setDropdownItems(temp);
  }, [items]);

  useEffect(() => {
    onChangeValue(dropdownValue);
  }, [dropdownValue]);

  return (
    <View style={tailwind('w-full mb-5')}>
      <View style={[
        style,
      ]}>
        <RNPickerSelect
          value={value}
          placeholder={{ label: placeholder, value: '' }}
          onValueChange={(value) => { setDropdownValue(value) }}
          items={dropdownItems}
          useNativeAndroidPickerStyle={false}
          disabled={!editable}
          style={{
            inputAndroid: tailwind(`w-full text-black font-sans text-16px border ${ shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary' } ${ hasError ? 'border border-red-500' : '' } bg-white items-center rounded-md pl-3 pr-8 py-3`),
            inputIOS: tailwind(`w-full font-sans text-16px ${ shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary' } ${ hasError ? 'border border-red-500' : '' } bg-white items-center rounded-md pl-3 pr-8 py-3`),
            inputWeb: tailwind(`w-full font-sans text-16px border ${ shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary' } ${ hasError ? 'border border-red-500' : '' } bg-white items-center rounded-md pl-3 pr-8 py-[13px] appearance-none`),
            placeholder: tailwind('text-gray-primary'),
            iconContainer: tailwind('elevation-5')
          }}
          Icon={() => {
            return (
              <TouchableOpacity onPress={() => { }}>
                <View style={[
                  tailwind('mt-3 mr-2'),
                  Platform.OS != 'web' ? tailwind('mt-4') : null,
                ]}>
                  <ArrowDownIcon width={20} height={20} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {
        hasError
          ?
          <TextLabel content={errorMessage ?? ''} color='text-red-500'/>
          :
          <></>
      }
    </View>
  )
}

export default DropdownField;