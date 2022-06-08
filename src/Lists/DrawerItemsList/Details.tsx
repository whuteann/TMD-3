import React from "react";
import { AwardIcon, CustomerIcon, GasIcon, ItemIcon, ItemPersonIcon, MoneyIcon, PortIcon, ProfileIcon, SettingsIcon, SettingsIcon2, ShipFrontIcon, ShipSideIcon } from "../../../assets/svg/SVG";

const details = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("CustomerList") },
      icon: <CustomerIcon height={25} width={25} />,
      text: "Customers",
    },
    // {
    //   onPress: (navigation) => { navigation.navigate("SupplierList") },
    //   icon: <ItemPersonIcon height={25} width={25} />,
    //   text: "Suppliers",
    // },
    {
      onPress: (navigation) => { navigation.navigate("SupplierList") },
      icon: <CustomerIcon height={25} width={25} />,
      text: "Suppliers",
    },
    {
      onPress: (navigation) => { navigation.navigate("BunkerBargeList") },
      icon: <ShipSideIcon height={25} width={25} />,
      text: "Bunker Vessel Details",
    },
    // {
    //   onPress: (navigation) => { navigation.navigate("ShipSpareList") },
    //   icon: <SettingsIcon2 height={25} width={25} />,
    //   text: "Ship Spares Details",
    // },
    {
      onPress: (navigation) => { navigation.navigate("ShipSpareList") },
      icon: <SettingsIcon height={25} width={25} />,
      text: "Ship Spares Details",
    },
    {
      onPress: (navigation) => { navigation.navigate("CustomerSegmentationList") },
      icon: <ProfileIcon height={25} width={25} />,
      text: "Customer Segmentations",
    },
    {
      onPress: (navigation) => { navigation.navigate("UnawardedRFQList") },
      icon: <AwardIcon height={25} width={25} />,
      text: "Un-awarded RFQ",
    },
    {
      onPress: (navigation) => { navigation.navigate("ProductList") },
      icon: <GasIcon height={25} width={25} />,
      text: "Product Details",
    },
    {
      onPress: (navigation) => { navigation.navigate("BankList") },
      icon: <MoneyIcon height={25} width={25} />,
      text: "Bank Details",
    },
    {
      onPress: (navigation) => { navigation.navigate("PortList") },
      icon: <ShipSideIcon height={25} width={25} />,
      text: "Port Details",
    },
  ]

  return tabs;
}

export default details;