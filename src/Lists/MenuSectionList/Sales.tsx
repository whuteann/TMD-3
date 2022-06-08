import React from "react";
import { CreateIcon, InvoiceIcon, QuotationIcon, ViewIcon } from "../../../assets/svg/SVG";
import { CREATE_QUOTATION, VIEW_INVOICE, VIEW_JOB_CONFIRMATION, VIEW_OFFICIAL_RECEIPT, VIEW_QUOTATION, VIEW_SALES_CONFIRMATION } from "../../permissions/Permissions";

const sales = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("CreateQuotation") },
      icon: <CreateIcon height={50} width={50} />,
      text: "CREATE QUOTATION",
      requiredPermissions: [CREATE_QUOTATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllQuotation") },
      icon: <QuotationIcon height={50} width={50} />,
      text: "VIEW ALL QUOTATIONS",
      requiredPermissions: [VIEW_QUOTATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSalesConfirmation") },
      icon: <ViewIcon height={50} width={50} />,
      text: "VIEW ALL SALES CONFIRMATION",
      requiredPermissions: [VIEW_SALES_CONFIRMATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllJobConfirmation") },
      icon: <ViewIcon height={50} width={50} />,
      text: "VIEW ALL JOB CONFIRMATION",
      requiredPermissions: [VIEW_JOB_CONFIRMATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllInvoice") },
      icon: <InvoiceIcon height={50} width={50} />,
      text: "VIEW ALL INVOICE",
      requiredPermissions: [VIEW_INVOICE]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllReceipt") },
      icon: <InvoiceIcon height={50} width={50} />,
      text: "VIEW ALL RECEIPT",
      requiredPermissions: [VIEW_OFFICIAL_RECEIPT]
    }
  ];

  if(!permissions) {
    return [];
  }

  return tabs.filter((tab) => {
    return tab.requiredPermissions?.every(element => permissions.indexOf(element) > -1);
  });
}

export default sales;