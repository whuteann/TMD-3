import React from "react";
import { HelpIcon, LogoutIcon, SettingsIcon } from "../../../assets/svg/SVG";

const apps = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("HelpScreen") },
      icon: <HelpIcon height={25} width={25} />,
      text: "Help Center",
    },
    {
      onPress: (navigation) => { navigation.navigate("ContactScreen") },
      icon: <SettingsIcon height={25} width={25} />,
      text: "Settings",
    }
  ]

  return tabs;
}

export default apps;