import { LogBox } from "react-native";

import { IS_WEB } from "./Platform";

if (!IS_WEB) {
  LogBox.ignoreLogs([
    "Warning: forwardRef render functions accept exactly two parameters: props and ref. Did you forget to use the ref parameter?",
    "Constants.linkingUrl has been renamed to Constants.linkingUri.",
    "Constants.deviceId has been deprecated in favor of generating and storing your own ID.",
    "Constants.installationId has been deprecated in favor of generating and storing your own ID.",
    "Setting a timer for a long period of time",
    "VirtualizedLists should never be nested"
  ]);
}else{
  LogBox.ignoreAllLogs();
}
