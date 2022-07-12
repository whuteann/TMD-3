import React from "react";
import { CartIcon, EditCartIcon, ViewPCIcon } from "../../../assets/svg/SVG";
import { CREATE_PROCUREMENT, CREATE_SPARES_PROCUREMENT, VIEW_PROCUREMENT, VIEW_PURCHASE_ORDER, VIEW_PURCHASE_VOUCHER, VIEW_SPARES_PROCUREMENT, VIEW_SPARES_PURCHASE_ORDER, VIEW_SPARES_PURCHASE_VOUCHER } from "../../permissions/Permissions";

const procurements = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("CreateProcurement") },
      icon: <EditCartIcon height={50} width={50} />,
      text: "CREATE PROCUREMENT",
      requiredPermissions: [CREATE_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllProcurement") },
      icon: <CartIcon height={50} width={50} />,
      text: "VIEW ALL PROCUREMENT",
      requiredPermissions: [VIEW_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllPurchaseOrder") },
      icon: <ViewPCIcon height={50} width={50} />,
      text: "VIEW ALL PURCHASE ORDER",
      requiredPermissions: [VIEW_PURCHASE_ORDER]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllPurchaseVoucher") },
      icon: <ViewPCIcon height={50} width={50} />,
      text: "VIEW ALL PURCHASE VOUCHER",
      requiredPermissions: [VIEW_PURCHASE_VOUCHER]
    },
    {
      onPress: (navigation) => { navigation.navigate("CreateSparesProcurement") },
      icon: <ViewPCIcon height={50} width={50} />,
      text: "CREATE SPARES PROCUREMENT",
      requiredPermissions: [CREATE_SPARES_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesProcurement") },
      icon: <CartIcon height={50} width={50} />,
      text: "VIEW ALL SPARES PROCUREMENT",
      requiredPermissions: [VIEW_SPARES_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesPurchaseOrder") },
      icon: <ViewPCIcon height={50} width={50} />,
      text: "VIEW ALL SPARES PURCHASE ORDER",
      requiredPermissions: [VIEW_SPARES_PURCHASE_ORDER]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesPurchaseVoucher") },
      icon: <ViewPCIcon height={50} width={50} />,
      text: "VIEW ALL SPARES PURCHASE VOUCHER",
      requiredPermissions: [VIEW_SPARES_PURCHASE_VOUCHER]
    },
  ];

  if (!permissions) {
    return [];
  }

  return tabs.filter((tab) => {
    return tab.requiredPermissions?.every(element => permissions.indexOf(element) > -1);
  });
}

export default procurements;