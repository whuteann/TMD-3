import React from "react";
import { CartIcon, CartSettingsIcon, EditCartIcon, OrderSettingsIcon, SettingsEyeIcon, ViewPCIcon, VoucherIcon, VoucherSettingsIcon } from "../../../assets/svg/SVG";
import { CREATE_PROCUREMENT, CREATE_SPARES_PROCUREMENT, VIEW_PROCUREMENT, VIEW_PURCHASE_ORDER, VIEW_PURCHASE_VOUCHER, VIEW_SPARES_PROCUREMENT, VIEW_SPARES_PURCHASE_ORDER } from "../../permissions/Permissions";

const procurements = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("CreateProcurement") },
      icon: <EditCartIcon height={25} width={25} />,
      text: "Create Procurement",
      requiredPermissions: [CREATE_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllProcurement") },
      icon: <CartIcon height={25} width={25} />,
      text: "View All Procurement",
      requiredPermissions: [VIEW_PROCUREMENT]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllPurchaseOrder") },
      icon: <ViewPCIcon height={25} width={25} />,
      text: "View All Purchase Order",
      requiredPermissions: [VIEW_PURCHASE_ORDER]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllPurchaseVoucher") },
      icon: <VoucherIcon height={25} width={25} />,
      text: "View All Purchase Voucher",
      requiredPermissions: [VIEW_PURCHASE_VOUCHER]
    },
    {
      onPress: (navigation) => { navigation.navigate("CreateSparesProcurement") },
      icon: <CartSettingsIcon height={25} width={25} />,
      text: "Create Spares Procurement",
      requiredPermissions: [CREATE_SPARES_PROCUREMENT]
    },
    // {
    //   onPress: (navigation) => { navigation.navigate("ViewAllSparesProcurement") },
    //   icon: <SettingsEyeIcon height={25} width={25} />,
    //   text: "View All Spares Procurement",
    //   requiredPermissions: [VIEW_SPARES_PROCUREMENT]
    // },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesProcurement") },
      icon: <ViewPCIcon height={25} width={25} />,
      text: "View All Spares Procurement",
      requiredPermissions: [VIEW_SPARES_PROCUREMENT]
    },
    // {
    //   onPress: (navigation) => { navigation.navigate("ViewAllSparesPurchaseOrder") },
    //   icon: <OrderSettingsIcon height={25} width={25} />,
    //   text: "View All Spares Purchase Order",
    //   requiredPermissions: [VIEW_SPARES_PURCHASE_ORDER]
    // },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesPurchaseOrder") },
      icon: <CartIcon height={25} width={25} />,
      text: "View All Spares Purchase Order",
      requiredPermissions: [VIEW_SPARES_PURCHASE_ORDER]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSparesPurchaseVoucher") },
      icon: <VoucherSettingsIcon height={25} width={25} />,
      text: "View All Spares Purchase Voucher",
      requiredPermissions: [VIEW_PURCHASE_VOUCHER]
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