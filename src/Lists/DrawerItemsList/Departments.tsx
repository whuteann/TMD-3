import React from "react";
import { HierachyIcon, ViewPCIcon } from "../../../assets/svg/SVG";

const departments = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("Departments") },
      icon: <HierachyIcon height={25} width={25} />,
      text: "View Departments",
    },
    {
      onPress: (navigation) => { navigation.navigate("Sales") },
      icon: <ViewPCIcon height={25} width={25} />,
      text: "View Sales",
    },
  ]
  return tabs;
}

export default departments;