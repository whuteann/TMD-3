import React from "react";
import {  CartSettingsIcon, HierachyIcon, ItemIcon, ItemPersonIcon, OrderSettingsIcon, ProfileIcon, SettingsEyeIcon, SettingsIcon, SettingsIcon2, VoucherIcon, VoucherSettingsIcon } from "../../../assets/svg/SVG";

const profile = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("Profile") },
      icon: <ProfileIcon height={25} width={25} />,
      text: "Profile",
    },

    // {
    //   onPress: (navigation) => { navigation.navigate("ContactScreen") },
    //   icon: <ContactBookIcon height={25} width={25} />,
    //   text: "Contact List",
    // },
    // {
    //   onPress: (navigation) => { navigation.navigate("TasksScreen") },
    //   icon: <ListIcon height={25} width={25} />,
    //   text: "Task List",
    // },
  ]

  return tabs;
}

export default profile;

