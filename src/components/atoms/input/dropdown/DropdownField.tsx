import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../typography/TextLabel';
import RNPickerSelect from 'react-native-picker-select';
import { ArrowDownIcon } from '../../../../../assets/svg/SVG';
import { Dropdown } from 'react-native-element-dropdown';

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
  const [dropdownValue, setDropdownValue] = useState<string | number | boolean | null>(value);
  const [dropdownItems, setDropdownItems] = useState([]);

  useEffect(() => {
    let temp = [] as any;

    if (items != undefined) {
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
        {
          Platform.OS == "ios"
            ?
            <Dropdown
              style={tailwind(`h-12 pl-5 pr-2 rounded-md bg-white ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} ${hasError ? 'border border-red-500' : ''}`)}
              // placeholderStyle={styles.placeholderStyle}
              // selectedTextStyle={styles.selectedTextStyle}
              // inputSearchStyle={styles.inputSearchStyle}
              // iconStyle={styles.iconStyle}
              renderRightIcon={()=><ArrowDownIcon height={20} width={20}/>}
              data={dropdownItems}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={placeholder}
              value={value}
              onChange={item => {
                setDropdownValue(item.value);
              }}
            />
            :
            <RNPickerSelect
              value={value}
              placeholder={{ label: placeholder, value: '' }}
              onValueChange={(value) => { setDropdownValue(value) }}
              items={dropdownItems}
              useNativeAndroidPickerStyle={false}
              disabled={!editable}
              style={{
                inputAndroid: tailwind(`w-full text-black font-sans text-16px border ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} ${hasError ? 'border border-red-500' : ''} bg-white items-center rounded-md pl-3 pr-8 py-3`),
                inputIOS: tailwind(`w-full font-sans text-16px ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} ${hasError ? 'border border-red-500' : ''} bg-white items-center rounded-md pl-3 pr-8 py-3`),
                inputWeb: tailwind(`w-full font-sans text-16px border ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} ${hasError ? 'border border-red-500' : ''} bg-white items-center rounded-md pl-3 pr-8 py-[13px] appearance-none`),
                placeholder: tailwind('text-gray-primary'),
                iconContainer: tailwind('elevation-5')
              }}
              Icon={() => {
                return (
                  <View style={[
                    tailwind('mt-3 mr-2'),
                    Platform.OS != 'web' ? tailwind('mt-4') : null,
                  ]}>
                    <ArrowDownIcon width={20} height={20} />
                  </View>
                );
              }}
            />
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

export default DropdownField;