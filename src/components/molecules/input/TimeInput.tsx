import React from "react";
import { Platform, View } from "react-native";
// import TimePickerMobileComponent from "../../atoms/input/datetimepickers/TimePickerMobileComponent";
// import TimePickerWebComponent from "../../atoms/input/datetimepickers/TimePickerWebComponent";

interface inputProps {
  value?: string,
  shadow?: boolean,
  editable?: boolean,
  onChangeText?: (text) => void,
}

const TimeInput: React.FC<inputProps> = (props: inputProps) => {
  return (
    <View>
      {/* {
        Platform.OS == "web"
          ?
          <TimePickerWebComponent {...props}/>
          :
          <TimePickerMobileComponent {...props}/>
      } */}
    </View>
  );
}

export default TimeInput; 