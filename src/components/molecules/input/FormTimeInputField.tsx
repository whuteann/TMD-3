import React from "react";
import { View } from "react-native";
import TimePickerField from "../../atoms/input/datetimepickers/TimePickerField";
import FormLabel from "../typography/FormLabel";

type ButtonProps = {
  label: string,
  value: string,
  placeholder?: string,
  required?: boolean,
  editable?: boolean,
  hasError?: boolean,
  errorMessage?: string,
  onChangeValue?: (value) => void
}

const FormTimeInputField: React.FC<ButtonProps> = ({
  label,
  placeholder = undefined,
  onChangeValue = (value) => { },
  value,
  editable = true,
  hasError = false,
  errorMessage = '',
  required = false,
}) => {
  return (
    <View>
      <FormLabel text={label} required={required}/>
      <TimePickerField
        placeholder={placeholder}
        value={value}
        onChangeText={text => onChangeValue(text)}
        editable={editable}
        hasError={hasError}
        errorMessage={errorMessage} />
    </View>
  )
}

export default FormTimeInputField;