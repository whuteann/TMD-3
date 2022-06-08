import React from "react";
import { View } from "react-native";
import MultilineTextInputField from "../../atoms/input/text/MultilineTextInputField";
import TextInputField from "../../atoms/input/text/TextInputField";
import FormLabel from "../typography/FormLabel";

type ButtonProps = {
  label: string,
  value: string,
  required?: boolean,
  placeholder?: string,
  editable?: boolean,
  multiline?: boolean,
  onChangeValue?: (value) => void
  number?: boolean,
  hasError?: boolean,
  errorMessage?: string,
  shadow?: boolean
}

const FormTextInputField: React.FC<ButtonProps> = ({
  label,
  placeholder = "",
  onChangeValue = (value) => { },
  value,
  multiline = false,
  editable = true,
  required = false,
  number = false,
  hasError = false,
  errorMessage = undefined,
  shadow = true,
}) => {

  return (
    <View>
      <FormLabel text={label} required={required} editable={editable}/>
      {
        multiline
          ?
          <MultilineTextInputField
            placeholder={placeholder}
            value={value}
            onChangeText={text => onChangeValue(text)}
            editable={editable}
            shadow={shadow}
            hasError={hasError}
            errorMessage={errorMessage}
          />
          :
          <TextInputField
            placeholder={placeholder}
            value={value}
            onChangeText={text => onChangeValue(text)}
            editable={editable}
            number={number}
            shadow={shadow}
            hasError={hasError}
            errorMessage={errorMessage}
          />
      }
    </View>
  )
}

export default FormTextInputField;