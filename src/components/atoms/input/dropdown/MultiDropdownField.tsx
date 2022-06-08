import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash';
import TextLabel from '../../typography/TextLabel';

interface inputProps {
  placeholder?: string,
  items: Array<string>
  onChangeValue?: (text: any) => void,
  value?: any,
  searchPlaceholder?: string,
  hasError?: boolean,
  errorMessage?: any,
  style?: any,
  shadow?: boolean,
  hideSearch?: boolean,
  editable?: boolean
}

const MultiDropdownField: React.FC<inputProps> = ({
  placeholder = '',
  onChangeValue = () => null,
  value,
  items,
  searchPlaceholder = 'Search',
  hasError = false,
  errorMessage = null,
  style = '',
  shadow = false,
  hideSearch = false,
  editable = true
}) => {
  const tailwind = useTailwind();
  const [selectedItems, setSelectedItems] = useState([]);
  const [options, setOptions] = useState<Array<{ item: string, id: string }>>();

  useEffect(() => {
    setSelectedItems(value);
  }, []);

  useEffect(() => {
    let temp: Array<{ item: string, id: string }> = [];
    items.map((item) => {
      temp.push({ item: item, id: item })
    })

    setOptions(temp);
  }, [items])


  const onMultiChange = () => {
    return (item) => {
      let result = [] as any;
      let output: Array<string> = []
      
      result = xorBy(selectedItems, [item], 'id');
      
      setSelectedItems(result);
      result.map((item) => {
        output.push(item.item)
      })
      onChangeValue(output);
    }
  }

  return (
    <View style={tailwind('w-full')}>
      <SelectBox
        label={placeholder}
        inputPlaceholder={searchPlaceholder}
        options={options}
        selectedValues={selectedItems}
        onMultiSelect={onMultiChange()}
        onTapClose={onMultiChange()}
        hideInputFilter={hideSearch}
        textInputProps={{ editable: false, autoFocus: false }}
        isMulti
        listOptionProps={{ nestedScrollEnabled: true }}
        arrowIconColor={tailwind('text-black').color}
        searchIconColor={tailwind('text-black').color}
        toggleIconColor={tailwind('text-primary').color}
        containerStyle={tailwind(`overflow-x-auto ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} bg-white items-center rounded-md py-3 pl-5 mb-3 ${hasError ? 'border border-red-500' : ''} ${style}`)}
        multiOptionContainerStyle={tailwind('bg-primary')}
        multiOptionsLabelStyle={tailwind('font-sans text-12px font-bold')}
        optionsLabelStyle={tailwind('font-sans text-14px')}
        selectedItemStyle={tailwind('font-sans text-black')}
        inputFilterStyle={tailwind(`font-sans text-14px font-bold ${Platform.OS == 'web' ? 'outline-none' : ''}`)}
      />

      {
        hasError
          ?
          <TextLabel content={errorMessage ?? ''} color='text-red-500' />
          :
          <></>
      }

      <View style={tailwind('mb-5')}></View>
    </View>
  )
}

export default MultiDropdownField;