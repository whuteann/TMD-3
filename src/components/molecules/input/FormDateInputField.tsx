import React from "react";
import { View } from "react-native";
import DatePickerField from "../../atoms/input/datetimepickers/DatePickerField";
import FormLabel from "../typography/FormLabel";

type dateProps = {
  label: string,
  value: string,
  placeholder?: string,
  required?: boolean,
  editable?: boolean,
  hasError?: boolean,
  errorMessage?: string,
  onChangeValue?: (value) => void,
  shadow?: boolean
}

const FormDateInputField: React.FC<dateProps> = ({
  label,
  value,
  required = false,
  editable = true,
  hasError = false,
  errorMessage = '',
  onChangeValue = (value) => {},
  shadow = true,
  placeholder = undefined,
}) => {
  
  return (
    <View>
      <FormLabel text={label} required={required}/>
      <DatePickerField 
        value={value} 
        placeholder={placeholder}
        onChangeText={text => onChangeValue(text)} 
        editable={editable}
        hasError={hasError}
        errorMessage={errorMessage}
        shadow={shadow} 
      />
    </View>
  )
}

export default FormDateInputField;