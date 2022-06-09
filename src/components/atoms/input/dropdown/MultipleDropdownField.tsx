import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../typography/TextLabel';
import DropDownPicker from 'react-native-dropdown-picker';

interface inputProps {
  placeholder: string,
  items: Array<string>
  onChangeValue?: (text: any) => void,
  value?: any,
  hasError?: boolean,
  errorMessage?: string,
  style?: any,
  shadow?: boolean,
}

type item = {
  label: string,
  value: string
}

const MultipleDropdownField: React.FC<inputProps> = ({
  placeholder,
  onChangeValue = () => null,
  value,
  items,
  hasError = false,
  errorMessage = null,
  style,
  shadow = false,
}) => {
  const tailwind = useTailwind();
  const [open, setOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState<Array<string | number | boolean> | null>(value);
  const [dropdownItems, setDropdownItems] = useState([
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' }
  ]);

  useEffect(() => {
    let temp: Array<item> = []
    items.map((item) => {
      temp.push({ label: item, value: item })
    })
    setDropdownItems(temp);
  }, [])

  useEffect(() => {
    onChangeValue(dropdownValue);
  }, [dropdownValue])

  return (
    <View style={tailwind('w-full')}>
      <View style={[
        tailwind('flex flex-row bg-white items-center rounded-md pl-3'),
        hasError ? tailwind('border-red-500') : null,
        style,
        shadow ? styles.boxWithShadow : null,
      ]}>
        <DropDownPicker
          multiple={true}
          dropDownDirection="BOTTOM"
          min={0}
          max={20}
          placeholder={placeholder}
          open={open}
          value={dropdownValue}
          items={dropdownItems}
          setOpen={setOpen}
          setValue={setDropdownValue}
          setItems={setDropdownItems}

          style={tailwind("flex-row h-12 py-3 px-2 bg-white border-0")}
          placeholderStyle={tailwind("font-sans text-16px")}
          arrowIconStyle={tailwind("h-6 w-6")}
          textStyle={tailwind("font-sans text-16px")}
          dropDownContainerStyle={tailwind("")}
          listItemContainerStyle={tailwind("flex-row px-2 my-3")}
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

const styles = StyleSheet.create({
  boxWithShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: "white",
    elevation: 2,
    backgroundColor: 'white',
  }
});

export default MultipleDropdownField;