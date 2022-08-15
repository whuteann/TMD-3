import React, { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { useTailwind } from 'tailwind-rn/dist';
import TextLabel from '../../typography/TextLabel';

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

const SearchableDropdownField: React.FC<inputProps> = ({
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
  const [changeText, onChangeText] = useState(value);
  const [dropdownItems, setDropdownItems] = useState<Array<{ value: string, show: boolean }>>([{ value: "", show: false }]);
  const [visible, setVisible] = useState(false);


  useEffect(() => {
    let temp = [] as any;

    if (items != undefined) {
      items.map((item) => {
        temp.push({ value: item, show: true })
      })
    }

    setDropdownItems(temp);
  }, []);


  useEffect(() => {
    const value = `${changeText}`.toLowerCase();
    const dropdownItemsClone = [...dropdownItems];

    dropdownItemsClone.map(item => {
      let isVisible = item.value.toLowerCase().includes(value);
      item.show = isVisible;
    })

    if (`${[...dropdownItemsClone]}` !== `${[{ value: "", show: false }]}`) {
      setDropdownItems(dropdownItemsClone);
    }

  }, [changeText])



  return (
    <View style={tailwind('w-full mb-5')}>
      <View style={[
        tailwind(`flex flex-row ${shadow ? 'border-0 box-card-shadow' : 'border border-gray-secondary'} bg-white items-center rounded-md pl-3`),
        hasError ? tailwind('border border-red-500') : null,
        style,
      ]}
      >
        <TextInput
          editable={editable}
          value={changeText}
          style={[
            tailwind(`w-full font-sans text-16px py-3 px-2 rounded-r-md`),
            editable ? tailwind('opacity-100') : tailwind('opacity-50'),
            Platform.OS == 'web' ? tailwind('outline-none') : null
          ]}
          placeholder={"Search..."}
          // onBlur={() => setVisible(false)}
          onEndEditing={() => setVisible(false)}
          onSubmitEditing={() => setVisible(false)}
          onFocus={() => setVisible(true)}
          onChangeText={(val) => {
            setVisible(true);
            onChangeText(val);
            onChangeValue("");
          }}
          returnKeyType="done"
          returnKeyLabel="done"
        />
      </View>

      {
        visible
          ?
          <View style={[tailwind(`justify-center bg-white box-card-shadow z-50 items-center w-full self-center absolute top-12 rounded-md z-50`), { elevation: 999, zIndex: 999 }]}>
            {
              dropdownItems.map((item, index) => {
                if (item.show) {
                  return (
                    <View key={index} style={tailwind(`w-full bg-white px-5 py-2 ${index == (dropdownItems.length - 1) ? "rounded-b-md" : ""}`)}>
                      <TouchableOpacity onPress={() => { setVisible(false); onChangeText(item.value); onChangeValue(item.value); }}>
                        <Text style={tailwind("text-14px font-sans")}>{item.value}</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
              })
            }
          </View>
          :
          <></>
      }
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

export default SearchableDropdownField;