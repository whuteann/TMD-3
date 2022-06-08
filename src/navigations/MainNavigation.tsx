import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigation from "./DrawerNavigation";
import ProductListScreen from "../features/details/products/ProductListScreen";
import ProductFormScreen from "../features/details/products/ProductFormScreen";
import ShipSpareFormScreen from "../features/details/shipSpares/ShipSpareFormScreen";
import CustomerFormScreen from "../features/details/customers/CustomerFormScreen";
import SupplierFormScreen from "../features/details/suppliers/SupplierFormScreen";
import CustomerListScreen from "../features/details/customers/CustomerListScreen";
import SupplierListScreen from "../features/details/suppliers/SupplierListScreen";
import BankListScreen from "../features/details/banks/BankListScreen";
import BankFormScreen from "../features/details/banks/BankFormScreen";

import { useSelector } from "react-redux";
import { UserSelector } from "../redux/reducers/Auth";
import protectedRoute from "./Middlewares/ProtectedRoute";

import {
  CREATE_PROCUREMENT,
  CREATE_QUOTATION,
  ISSUE_INVOICE,
  ISSUE_OFFICIAL_RECEIPT,
  VIEW_INVOICE,
  VIEW_JOB_CONFIRMATION,
  VIEW_OFFICIAL_RECEIPT,
  VIEW_PURCHASE_ORDER,
  VIEW_QUOTATION,
  VIEW_SALES_CONFIRMATION,
  VIEW_PROCUREMENT,
  VIEW_PURCHASE_VOUCHER,
  CREATE_USER,
  CREATE_SPARES_PROCUREMENT,
  VIEW_SPARES_PROCUREMENT,
  CREATE_SPARES_PURCHASE_ORDER,
  VIEW_SPARES_PURCHASE_ORDER,
  CREATE_PURCHASE_VOUCHER
} from "../permissions/Permissions";

import LoadingData from "../components/atoms/loading/loadingData";
import ProfileScreen from "../features/auth/ProfileScreen";

import UserFormScreen from "../features/department/users/UserFormScreen";
import BunkerBargeListScreen from "../features/details/bunkers/BunkerBargeListScreen";
import BunkerDetailsScreen from "../features/details/bunkers/BunkerDetailsScreen";
import BunkerFormScreen from "../features/details/bunkers/BunkerFormScreen";
import UnawardedRFQListScreen from "../features/details/unawardedRFQ/UnawardedRFQListScreen";
import UnawardedRFQFormScreen from "../features/details/unawardedRFQ/UnawardedRFQFormScreen";
import ShipSpareListScreen from "../features/details/shipSpares/ShipSparesListScreen";
import PortListScreen from "../features/details/ports/PortListScreen";
import PortFormScreen from "../features/details/ports/PortFormScreen";
import SalesListScreen from "../features/details/sales/SaleListScreen";
import SalesSummaryScreen from "../features/details/sales/SalesSummaryScreen";
import ViewAllQuotationScreen from "../features/sales/viewQuotation/ViewAllQuotationScreen";
import CreateQuotationFormScreen from "../features/sales/createQuotation/CreateQuotationFormScreen";
import ViewQuotationSummaryScreen from "../features/sales/viewQuotation/ViewQuotationSummaryScreen";
import ProceedSalesConfirmationScreen from "../features/sales/viewQuotation/ProceedSalesConfirmation";
import ProceedSalesConfirmationFinalScreen from "../features/sales/viewQuotation/ProceedSalesConfirmationFinalScreen";
import ViewSalesConfirmationSummaryScreen from "../features/sales/viewConfirmation/ViewSalesConfirmationSummaryScreen";
import ViewAllJobConfirmationScreen from "../features/sales/viewJobConfirmation/ViewAllJobConfirmationScreen";
import ViewJobConfirmationSummaryScreen from "../features/sales/viewJobConfirmation/ViewJobConfirmationSummaryScreen";
import CreateInvoiceFormScreen from "../features/sales/createInvoice/CreateInvoiceFormScreen";
import CreateInvoiceSummaryScreen from "../features/sales/createInvoice/CreateInvoiceSummaryScreen";
import ViewAllInvoiceScreen from "../features/sales/viewInvoice/ViewAllInvoiceScreen";
import ViewInvoiceSummaryScreen from "../features/sales/viewInvoice/ViewInvoiceSummary";
import ViewAllReceiptScreen from "../features/sales/viewReceipt/ViewAllReceiptScreen";
import ViewReceiptSummaryScreen from "../features/sales/viewReceipt/ViewReceiptSummaryScreen";
import CreateProcurementFormScreen from "../features/procurement/createProcurement/CreateProcurmentFormScreen";
import ViewAllPurchaseOrderScreen from "../features/procurement/viewPurchaseOrder/ViewAllPurchaseOrderScreen";
import ViewPurchaseOrderSummaryScreen from "../features/procurement/viewPurchaseOrder/ViewPurchaseOrderSummary";
import ViewAllProcurementSearchScreen from "../features/procurement/viewProcurement/ViewAllProcurementScreen";
import ViewProcurementSummaryScreen from "../features/procurement/viewProcurement/ViewProcurementSummaryScreen";
import CreatePurchaseOrderFormScreen from "../features/procurement/createPurchaseOrder/CreatePurchaseOrderFormScreen";
import CreatePurchaseOrderSummaryScreen from "../features/procurement/createPurchaseOrder/CreatePurchaseOrderSummary";
import CreatePurchaseVoucherFormScreen from "../features/procurement/createPurchaseVoucher/CreatePurchaseVoucherFormScreen";
import CreatePurchaseVoucherSummaryScreen from "../features/procurement/createPurchaseVoucher/CreatePurchaseVoucherSummaryScreen";
import ViewAllPurchaseVoucherScreen from "../features/procurement/viewPurchaseVoucher/ViewAllPurchaseVoucherScreen";
import ViewPurchaseVoucherSummaryScreen from "../features/procurement/viewPurchaseVoucher/ViewPurchaseVoucherSummaryScreen";
import CreateSparesProcurementSummaryScreen from "../features/procurement/createSparesProcurement/CreateSparesProcurementSummaryScreen";
import EditQuotationFormScreen from "../features/sales/createQuotation/EditQuotationFormScreen";
import CreateQuotationFormScreen2 from "../features/sales/createQuotation/CreateQuotationFormScreen2";
import CreateQuotationSummaryScreen from "../features/sales/createQuotation/CreateQuotationSummaryScreen";
import ViewAllSalesConfirmationScreen from "../features/sales/viewConfirmation/ViewAllSalesConfirmationScreen";
import EditInvoiceFormScreen from "../features/sales/createInvoice/EditInvoiceFormScreen";
import CreateInvoiceFormScreen2 from "../features/sales/createInvoice/CreateInvoiceFormScreen2";
import PreviewInvoiceSummaryScreen from "../features/sales/viewInvoice/PreviewInvoiceScreen";
import CreateReceiptFormScreen from "../features/sales/issueReceipt/CreateReceiptForm";
import EditReceiptFormScreen from "../features/sales/issueReceipt/EditReceiptForm";
import CreateReceiptSummaryScreen from "../features/sales/issueReceipt/CreateReceiptSummaryScreen";
import PreviewPurchaseOrderScreen from "../features/procurement/viewPurchaseOrder/PreviewPurchaseOrderScreen";
import PreviewProcurementScreen from "../features/procurement/viewProcurement/PreviewProcurmentScreen";
import EditPurchaseOrderFormScreen from "../features/procurement/createPurchaseOrder/EditPurchaseOrderFormScreen";
import EditPurchaseVoucherFormScreen from "../features/procurement/createPurchaseVoucher/EditPurchaseVoucherFormScreen";
import CreateSparesProcurementFormScreen from "../features/procurement/createSparesProcurement/CreateSparesProcurementFormScreen";
import EditSparesProcurementFormScreen from "../features/procurement/createSparesProcurement/EditSparesProcurementFormScreen";
import ViewAllSparesProcurementSearchScreen from "../features/procurement/viewSparesProcurement/ViewAllSparesProcurmentScreen";
import ViewSparesProcurementSummaryScreen from "../features/procurement/viewSparesProcurement/ViewSparesProcurementSummary";
import PreviewSparesProcurementSummaryScreen from "../features/procurement/viewSparesProcurement/PreviewSparesProcurementSummaryScreen";
import ViewSparesProcurementApproveScreen from "../features/procurement/viewSparesProcurement/ViewSparesProcurementApproveScreen";
import CreateSparesPurchaseOrderFormScreen from "../features/procurement/createSparesPurchaseOrder/CreateSparesPurchaseOrderFormScreen";
import EditSparesPurchaseOrderFormScreen from "../features/procurement/createSparesPurchaseOrder/EditSparesPurchaseOrderFormScreen";
import CreateSparesPurchaseOrderFormScreen2 from "../features/procurement/createSparesPurchaseOrder/CreateSparesPurchaseOrderFormScreen2";
import CreateSparesPurchaseOrderSummaryScreen from "../features/procurement/createSparesPurchaseOrder/CreateSparesPurchaseOrderSummaryScreen";
import ViewAllSparesPurchaseOrderScreen from "../features/procurement/viewSparesPurchaseOrder/ViewAllSparesPurchaseOrderScreen";
import ViewSparesPurchaseOrderSummaryScreen from "../features/procurement/viewSparesPurchaseOrder/ViewSparesPurchaseOrderSummary";
import PreviewSparesPurchaseOrderSummaryScreen from "../features/procurement/viewSparesPurchaseOrder/PreviewSparesPurchaseOrderSummary";
import CreateSparesPurchaseVoucherFormScreen from "../features/procurement/createSparesPurchaseVoucher/CreateSparesPurchaseVoucherFormScreen";
import EditSparesPurchaseVoucherFormScreen from "../features/procurement/createSparesPurchaseVoucher/EditSparesPurchaseVoucherFormScreen";
import CreateSparesPurchaseVoucherSummaryScreen from "../features/procurement/createSparesPurchaseVoucher/CreateSparesPurchasevoucherSummaryScreen";
import ViewAllSparesPurchaseVoucherScreen from "../features/procurement/viewSparesPurchaseVoucher/ViewAllSparesPurchaseVoucherScreen";
import ViewSparesPurchaseVoucherSummaryScreen from "../features/procurement/viewSparesPurchaseVoucher/ViewSparesPurchaseVoucherSummaryScreen";
import DepartmentListScreen from "../features/department/DepartmentListScreen";
import CustomerSegmentationFormScreen from "../features/details/customerSegmentation/CustomerSegmentationFormScreen";
import CustomerSegmentationListScreen from "../features/details/customerSegmentation/CustomerSegmentationListScreen";





const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  const user = useSelector(UserSelector);
  const permissions = user?.permission;

  if (!user) {
    return (
      <Stack.Navigator initialRouteName="Loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingData} options={{ title: "Loading..." }} />
      </Stack.Navigator>
    );
  }

  if (user?.contacts?.length == 0 || user?.contacts?.[0].number == "" || user?.contacts == undefined) {
    return (
      <Stack.Navigator initialRouteName="Profile" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
        <Stack.Screen name="Dashboard" component={DrawerNavigation} options={{ title: "Dashboard" }} />
      </Stack.Navigator>
    )
  };

  return (
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DrawerNavigation} options={{ title: "Dashboard" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="LoadingData" component={LoadingData} options={{ title: "Loading..." }} />

      {/* Create quotation */}
      {(() => protectedRoute('CreateQuotation', CreateQuotationFormScreen, "Quotations", Stack, permissions, [CREATE_QUOTATION]))()}
      {(() => protectedRoute('EditQuotation', EditQuotationFormScreen, "Quotations", Stack, permissions, [VIEW_QUOTATION]))()}
      {(() => protectedRoute('CreateQuotation2', CreateQuotationFormScreen2, "Quotations", Stack, permissions, [CREATE_QUOTATION]))()}
      {(() => protectedRoute('CreateQuotationSummary', CreateQuotationSummaryScreen, "Quotations", Stack, permissions, [CREATE_QUOTATION]))()}

      {/* View Quotation */}
      {(() => protectedRoute('ViewAllQuotation', ViewAllQuotationScreen, "View Quotation", Stack, permissions, [VIEW_QUOTATION]))()}
      {(() => protectedRoute('ViewQuotationSummary', ViewQuotationSummaryScreen, "View Quotation", Stack, permissions, [VIEW_QUOTATION]))()}
      {(() => protectedRoute('ProceedSalesConfirmation', ProceedSalesConfirmationScreen, "Proceed Sales", Stack, permissions, [VIEW_QUOTATION]))()}
      {(() => protectedRoute('ProceedSalesConfirmationFinal', ProceedSalesConfirmationFinalScreen, "Proceed Sales", Stack, permissions, [VIEW_QUOTATION]))()}

      {/* View Sales Confirmation */}
      {(() => protectedRoute('ViewAllSalesConfirmation', ViewAllSalesConfirmationScreen, "View Sales Confirmation", Stack, permissions, [VIEW_SALES_CONFIRMATION]))()}
      {(() => protectedRoute('SalesConfirmationSummary', ViewSalesConfirmationSummaryScreen, "View Sales Confirmation", Stack, permissions, [VIEW_SALES_CONFIRMATION]))()}

      {/* View Job Confirmation */}
      {(() => protectedRoute('ViewAllJobConfirmation', ViewAllJobConfirmationScreen, "View Job Confirmation", Stack, permissions, [VIEW_JOB_CONFIRMATION]))()}
      {(() => protectedRoute('JobConfirmationSummary', ViewJobConfirmationSummaryScreen, "View Job Confirmation", Stack, permissions, [VIEW_JOB_CONFIRMATION]))()}

      {/* Create Invoice */}
      {(() => protectedRoute('CreateInvoice', CreateInvoiceFormScreen, "Invoices", Stack, permissions, [ISSUE_INVOICE]))()}
      {(() => protectedRoute('EditInvoice', EditInvoiceFormScreen, "Invoices", Stack, permissions, [VIEW_INVOICE]))()}
      {(() => protectedRoute('CreateInvoice2', CreateInvoiceFormScreen2, "Invoices", Stack, permissions, [ISSUE_INVOICE]))()}
      {(() => protectedRoute('CreateInvoiceSummary', CreateInvoiceSummaryScreen, "Invoices", Stack, permissions, [VIEW_INVOICE]))()}

      {/* View Invoice */}
      {(() => protectedRoute('ViewAllInvoice', ViewAllInvoiceScreen, "View Invoice", Stack, permissions, [ISSUE_INVOICE]))()}
      {(() => protectedRoute('ViewInvoiceSummary', ViewInvoiceSummaryScreen, "View Invoice", Stack, permissions, [VIEW_INVOICE]))()}
      {(() => protectedRoute('PreviewInvoiceSummary', PreviewInvoiceSummaryScreen, "View Invoice", Stack, permissions, [VIEW_INVOICE]))()}

      {/* Issue Official Receipt */}
      {(() => protectedRoute('CreateOfficialReceipt', CreateReceiptFormScreen, "Receipts", Stack, permissions, [ISSUE_OFFICIAL_RECEIPT]))()}
      {(() => protectedRoute('EditOfficialReceipt', EditReceiptFormScreen, "Receipts", Stack, permissions, [VIEW_OFFICIAL_RECEIPT]))()}
      {(() => protectedRoute('CreateReceiptSummary', CreateReceiptSummaryScreen, "Receipts", Stack, permissions, [VIEW_OFFICIAL_RECEIPT]))()}

      {/* View Receipt */}
      {(() => protectedRoute('ViewAllReceipt', ViewAllReceiptScreen, "View Receipt", Stack, permissions, [VIEW_OFFICIAL_RECEIPT]))()}
      {(() => protectedRoute('ViewReceiptSummary', ViewReceiptSummaryScreen, "Receipts", Stack, permissions, [VIEW_OFFICIAL_RECEIPT]))()}

      {/* Create Procurement  */}
      {(() => protectedRoute('CreateProcurement', CreateProcurementFormScreen, "Procurement", Stack, permissions, [CREATE_PROCUREMENT]))()}

      {/* View Purchase Order */}
      {(() => protectedRoute('ViewAllPurchaseOrder', ViewAllPurchaseOrderScreen, "View Purchase Orders", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}
      {(() => protectedRoute('ViewPurchaseOrderSummary', ViewPurchaseOrderSummaryScreen, "View Purchase Orders", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}
      {(() => protectedRoute('PreviewPurchaseOrder', PreviewPurchaseOrderScreen, "View Purchase Order", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}

      {/* View Procurement */}
      {(() => protectedRoute('ViewAllProcurement', ViewAllProcurementSearchScreen, "View Procurements", Stack, permissions, [VIEW_PROCUREMENT]))()}
      {(() => protectedRoute('ViewProcurementSummary', ViewProcurementSummaryScreen, "View Procurements", Stack, permissions, [VIEW_PROCUREMENT]))()}
      {(() => protectedRoute('PreviewProcurement', PreviewProcurementScreen, "View Procurement", Stack, permissions, [VIEW_PROCUREMENT]))()}

      {/* Create Purchase Order */}
      {(() => protectedRoute('CreatePurchaseOrderForm', CreatePurchaseOrderFormScreen, "Purchase Orders", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}
      {(() => protectedRoute('EditPurchaseOrderForm', EditPurchaseOrderFormScreen, "Purchase Orders", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}
      {(() => protectedRoute('CreatePurchaseOrderSummary', CreatePurchaseOrderSummaryScreen, "Purchase Orders", Stack, permissions, [VIEW_PURCHASE_ORDER]))()}

      {/* Create Purchase Voucher */}
      {(() => protectedRoute('CreatePurchaseVoucherForm', CreatePurchaseVoucherFormScreen, "Purchase Vouchers", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('EditPurchaseVoucherForm', EditPurchaseVoucherFormScreen, "Purchase Vouchers", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('CreatePurchaseVoucherSummary', CreatePurchaseVoucherSummaryScreen, "Purchase Vouchers", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}

      {/* View Purchase Voucher */}
      {(() => protectedRoute('ViewAllPurchaseVoucher', ViewAllPurchaseVoucherScreen, "View Purchase Vouchers", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('ViewPurchaseVoucherSummary', ViewPurchaseVoucherSummaryScreen, "View Purchase Vouchers", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}

      {/* Create Spares Procurement */}
      {(() => protectedRoute('CreateSparesProcurement', CreateSparesProcurementFormScreen, "Spares Procurements", Stack, permissions, [CREATE_SPARES_PROCUREMENT]))()}
      {(() => protectedRoute('EditSparesProcurement', EditSparesProcurementFormScreen, "Spares Procurements", Stack, permissions, [CREATE_SPARES_PROCUREMENT]))()}
      {(() => protectedRoute('CreateSparesProcurementSummary', CreateSparesProcurementSummaryScreen, "Spares Procurements", Stack, permissions, [CREATE_SPARES_PROCUREMENT]))()}

      {/* View Spares Procurement */}
      {(() => protectedRoute('ViewAllSparesProcurement', ViewAllSparesProcurementSearchScreen, "View Spares Procurements", Stack, permissions, [VIEW_SPARES_PROCUREMENT]))()}
      {(() => protectedRoute('ViewSparesProcurementSummary', ViewSparesProcurementSummaryScreen, "View Spares Procurements", Stack, permissions, [VIEW_SPARES_PROCUREMENT]))()}
      {(() => protectedRoute('PreviewSparesProcurementSummary', PreviewSparesProcurementSummaryScreen, "View Spares Procurements", Stack, permissions, [VIEW_SPARES_PROCUREMENT]))()}
      {(() => protectedRoute('ViewSparesProcurementApprove', ViewSparesProcurementApproveScreen, "View Spares Procurements", Stack, permissions, [VIEW_SPARES_PROCUREMENT]))()}


      {/* Create Spares Purchase Order */}
      {(() => protectedRoute('CreateSparesPurchaseOrder', CreateSparesPurchaseOrderFormScreen, "Spares Purchase Order", Stack, permissions, [CREATE_SPARES_PURCHASE_ORDER]))()}
      {(() => protectedRoute('EditSparesPurchaseOrder', EditSparesPurchaseOrderFormScreen, "Spares Purchase Order", Stack, permissions, [CREATE_SPARES_PURCHASE_ORDER]))()}
      {(() => protectedRoute('CreateSparesPurchaseOrder2', CreateSparesPurchaseOrderFormScreen2, "Spares Purchase Order", Stack, permissions, [CREATE_SPARES_PURCHASE_ORDER]))()}
      {(() => protectedRoute('CreateSparesPurchaseOrderSummary', CreateSparesPurchaseOrderSummaryScreen, "Spares Purchase Order", Stack, permissions, [CREATE_SPARES_PURCHASE_ORDER]))()}

      {/* View Spares Purchase Order */}
      {(() => protectedRoute('ViewAllSparesPurchaseOrder', ViewAllSparesPurchaseOrderScreen, "View Spares Purchase Order", Stack, permissions, [VIEW_SPARES_PURCHASE_ORDER]))()}
      {(() => protectedRoute('ViewSparesPurchaseOrderSummary', ViewSparesPurchaseOrderSummaryScreen, "View Spares Purchase Order", Stack, permissions, [VIEW_SPARES_PURCHASE_ORDER]))()}
      {(() => protectedRoute('PreviewSparesPurchaseOrderSummary', PreviewSparesPurchaseOrderSummaryScreen, "View Spares Purchase Order", Stack, permissions, [VIEW_SPARES_PURCHASE_ORDER]))()}

      {/* Create Spares Purchase Voucher */}
      {(() => protectedRoute('CreateSparesPurchaseVoucherForm', CreateSparesPurchaseVoucherFormScreen, "Spares Purchase Voucher", Stack, permissions, [CREATE_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('EditSparesPurchaseVoucherForm', EditSparesPurchaseVoucherFormScreen, "Spares Purchase Voucher", Stack, permissions, [CREATE_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('CreateSparesPurchaseVoucherSummary', CreateSparesPurchaseVoucherSummaryScreen, "Spares Purchase Voucher", Stack, permissions, [CREATE_PURCHASE_VOUCHER]))()}

      {/* View Spares Purchase Voucher */}
      {(() => protectedRoute('ViewAllSparesPurchaseVoucher', ViewAllSparesPurchaseVoucherScreen, "View Spares Purchase Voucher", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}
      {(() => protectedRoute('ViewSparesPurchaseVoucherSummary', ViewSparesPurchaseVoucherSummaryScreen, "View Spares Purchase Voucher", Stack, permissions, [VIEW_PURCHASE_VOUCHER]))()}

      {/* Departments */}
      <Stack.Screen name="Departments" component={DepartmentListScreen} />
      <Stack.Screen name="Sales" component={SalesListScreen} options={{ title: "Sales" }} />
      <Stack.Screen name="SalesSummary" component={SalesSummaryScreen} options={{ title: "Sales" }} />
      {(() => protectedRoute('CreateUser', UserFormScreen, "Users", Stack, permissions, [CREATE_USER]))()}

      <Stack.Screen name="EditUser" component={UserFormScreen} />

      {/* Details */}
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: "Customers" }} />
      <Stack.Screen name="CreateCustomer" component={CustomerFormScreen} options={{ title: "Customers" }} />
      <Stack.Screen name="EditCustomer" component={CustomerFormScreen} options={{ title: "Customers" }} />
      {/* <Stack.Screen name="CustomerDetail" component={ViewCustomer} options={{ title: "Customers" }} /> */}
      <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: "Suppliers" }} />
      <Stack.Screen name="CreateSupplier" component={SupplierFormScreen} options={{ title: "Suppliers" }} />
      <Stack.Screen name="EditSupplier" component={SupplierFormScreen} options={{ title: "Suppliers" }} />

      <Stack.Screen name="BunkerBargeList" component={BunkerBargeListScreen} options={{ title: "Bunker Barges" }} />
      <Stack.Screen name="BunkerDetail" component={BunkerDetailsScreen} options={{ title: "Bunker Barges" }} />
      <Stack.Screen name="CreateBunker" component={BunkerFormScreen} options={{ title: "Bunker Barges" }} />
      <Stack.Screen name="EditBunker" component={BunkerFormScreen} options={{ title: "Bunker Barges" }} />

      <Stack.Screen name="BankList" component={BankListScreen} options={{ title: "Banks" }} />
      <Stack.Screen name="EditBank" component={BankFormScreen} options={{ title: "Banks" }} />
      <Stack.Screen name="CreateBank" component={BankFormScreen} options={{ title: "Banks" }} />

      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: "Products" }} />
      <Stack.Screen name="EditProduct" component={ProductFormScreen} options={{ title: "Products" }} />
      <Stack.Screen name="CreateProduct" component={ProductFormScreen} options={{ title: "Products" }} />

      <Stack.Screen name="UnawardedRFQList" component={UnawardedRFQListScreen} options={{ title: "Unawarded RFQ" }} />
      <Stack.Screen name="CreateUnawardedRFQ" component={UnawardedRFQFormScreen} options={{ title: "Unawarded RFQ" }} />
      <Stack.Screen name="EditUnawardedRFQ" component={UnawardedRFQFormScreen} options={{ title: "Unawarded RFQ" }} />

      <Stack.Screen name="ShipSpareList" component={ShipSpareListScreen} options={{ title: "Ship Spares" }} />
      <Stack.Screen name="EditShipSpare" component={ShipSpareFormScreen} options={{ title: "Ship Spares" }} />
      <Stack.Screen name="CreateShipSpare" component={ShipSpareFormScreen} options={{ title: "Ship Spares" }} />

      <Stack.Screen name="CustomerSegmentationList" component={CustomerSegmentationListScreen} options={{ title: "Customer Segmentation" }} />
      <Stack.Screen name="EditCustomerSegmentation" component={CustomerSegmentationFormScreen} options={{ title: "Customer Segmentation" }} />
      <Stack.Screen name="CreateCustomerSegmentation" component={CustomerSegmentationFormScreen} options={{ title: "Customer Segmentation" }} />

      <Stack.Screen name="PortList" component={PortListScreen} options={{ title: "Ports" }} />
      <Stack.Screen name="CreatePort" component={PortFormScreen} options={{ title: "Ports" }} />
      <Stack.Screen name="EditPort" component={PortFormScreen} options={{ title: "Ports" }} />

      {/* <Stack.Screen name="QuotationSaleSummary" component={QuotationSaleSummaryScreen} options={{ title: "Quotation Summary" }} /> */}
    </Stack.Navigator>
  );
}

export default MainNavigation;
