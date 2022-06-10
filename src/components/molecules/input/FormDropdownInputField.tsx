import React from "react";
import { View } from "react-native";
import { useTailwind } from "tailwind-rn/dist";
import DropdownField from "../../atoms/input/dropdown/DropdownField";
import MultiDropdownField from "../../atoms/input/dropdown/MultiDropdownField";
import FormLabel from "../typography/FormLabel";

type ButtonProps = {
  label: string,
  value: string | Array<string>,
  items: any,
  required?: boolean,
  multiple?: boolean,
  placeholder?: string,
  hideMultiSearch?: boolean,
  onChangeValue?: (value) => void,
  hasError?: boolean,
  errorMessage?: any,
  shadow?: boolean,
  editable?: boolean
}

const FormDropdownInputField: React.FC<ButtonProps> = ({
  label,
  items,
  shadow = true,
  multiple = false,
  placeholder = 'Select',
  hideMultiSearch = true,
  onChangeValue = (value) => { },
  value,
  required = false,
  hasError = false,
  errorMessage = '',
  editable = true
}) => {
  const tailwind = useTailwind();

  return (
    <View style={tailwind('w-full')}>
      <FormLabel text={label} required={required} />
      {
        multiple
          ?
          <MultiDropdownField
            items={items}
            value={value}
            onChangeValue={(val) => { onChangeValue(val) }}
            shadow={shadow}
            hideSearch={hideMultiSearch}
            hasError={hasError}
            errorMessage={errorMessage}
            editable={editable}
          />
          :
          <DropdownField
            items={items}
            placeholder={placeholder}
            value={value}
            onChangeValue={(val) => { onChangeValue(val) }}
            shadow={shadow}
            hasError={hasError}
            errorMessage={errorMessage}
            editable={editable}
          />
      }
    </View>
  )
}

export default FormDropdownInputField;