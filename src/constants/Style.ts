import { Platform } from "react-native";
import { getWindow } from "../helpers/GenericHelper";

export const getListStyle = () => {
  if(Platform.OS == 'web') {
    return {
      paddingTop: 3,
      paddingLeft: 3,
      paddingRight: 3,
      height: getWindow().height
    };
  }

  return {
    paddingTop: 3,
    paddingLeft: 3,
    paddingRight: 3,
  };
}