import React from "react";
import { CreateIcon, InvoiceIcon, QuotationIcon, ViewIcon } from "../../../assets/svg/SVG";
import { CREATE_QUOTATION, VIEW_INVOICE, VIEW_JOB_CONFIRMATION, VIEW_OFFICIAL_RECEIPT, VIEW_QUOTATION, VIEW_SALES_CONFIRMATION } from "../../permissions/Permissions";

const sales = (permissions: string[] | undefined) => {
  let tabs = [
    {
      onPress: (navigation) => { navigation.navigate("CreateQuotation") },
      icon: <CreateIcon height={25} width={25} />,
      text: "Create Quotation",
      requiredPermissions: [CREATE_QUOTATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllQuotation") },
      icon: <QuotationIcon height={25} width={25} />,
      text: "View All Quotation",
      requiredPermissions: [VIEW_QUOTATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllSalesConfirmation") },
      icon: <ViewIcon height={25} width={25} />,
      text: "View All Sales Confirmation",
      requiredPermissions: [VIEW_SALES_CONFIRMATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllJobConfirmation") },
      icon: <ViewIcon height={25} width={25} />,
      text: "View All Job Confirmation",
      requiredPermissions: [VIEW_JOB_CONFIRMATION]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllInvoice") },
      icon: <InvoiceIcon height={25} width={25} />,
      text: "View All Invoice",
      requiredPermissions: [VIEW_INVOICE]
    },
    {
      onPress: (navigation) => { navigation.navigate("ViewAllReceipt") },
      icon: <InvoiceIcon height={25} width={25} />,
      text: "View All Receipt",
      requiredPermissions: [VIEW_OFFICIAL_RECEIPT]
    }
  ];

  if (!permissions) {
    return [];
  }

  return tabs.filter((tab) => {
    return tab.requiredPermissions?.every(element => permissions.indexOf(element) > -1);
  });
}

export default sales;