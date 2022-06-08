import { RouteProp } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export interface DrawerNavigationProps<RouteName extends keyof DrawerRoutes> {
  navigation: DrawerNavigationProp<DrawerRoutes, RouteName>;
  route: RouteProp<DrawerRoutes, RouteName>;
}

export interface AuthNavigationProps<RouteName extends keyof AuthRoutes> {
  navigation: NativeStackNavigationProp<AuthRoutes, RouteName>;
  route: RouteProp<AuthRoutes, RouteName>;
}

export interface RootNavigationProps<RouteName extends keyof RootRoutes> {
  navigation: NativeStackNavigationProp<RootRoutes, RouteName>;
  route: RouteProp<RootRoutes, RouteName>;
}

export type DrawerRoutes = {
  Dashboard: undefined;
  Profile: { docID?: string };
}

export type AuthRoutes = {
  Login: undefined;
  ForgetPassword: undefined;
}

export type RootRoutes = {
  Auth: undefined;
  Login: undefined;
  ForgetPassword: undefined;
  Main: undefined;
  Loading: undefined;
  InvalidEmail: undefined;

  Dashboard: undefined;
  Profile: { docID?: string };

  CreateQuotation: undefined;
  EditQuotation: { docID: string };
  CreateQuotation2: { action: "create" | "edit", docID: string };
  CreateQuotationSummary: { docID: string };
  ViewAllQuotation: undefined;
  ViewQuotationSummary: { docID: string };
  ProceedSalesConfirmation: { docID: string };
  ProceedSalesConfirmationFinal: { docID: string };

  ViewAllSalesConfirmation: undefined;
  SalesConfirmationSummary: { docID: string | null | undefined };

  Departments: undefined;
  Sales: undefined;
  SalesSummary: { docID: string };
  CreateUser: undefined;
  EditUser: { docID: string | null | undefined };

  ViewAllJobConfirmation: undefined;
  JobConfirmationSummary: { docID: string | undefined, status: string };

  CreateInvoice: { docID: string };
  EditInvoice: { docID: string };
  CreateInvoice2: { docID: string };
  CreateInvoiceSummary: { docID: string };

  ViewAllInvoice: undefined;
  ViewInvoiceSummary: { docID: string };
  PreviewInvoiceSummary: { docID: string };

  CreateOfficialReceipt: { docID: string };
  EditOfficialReceipt: { docID: string };
  CreateReceiptSummary: { docID: string };
  ViewReceiptSummary: { docID: string };
  ViewAllReceipt: undefined;

  SaleList: undefined;
  // QuotationSaleSummary: { docID: string };

  CustomerList: undefined;
  CreateCustomer: undefined;
  EditCustomer: { docID: string };
  CustomerDetail: { docID: string };
  UpdateContactList: { docID: string };

  SupplierList: undefined;
  CreateSupplier: undefined;
  EditSupplier: { docID: string };

  UnawardedRFQList: undefined;
  CreateUnawardedRFQ: undefined;
  EditUnawardedRFQ: { docID: string | null | undefined };

  BunkerBargeList: undefined;
  BunkerDetail: { docID: string };
  CreateBunker: undefined;
  EditBunker: { docID: string | null | undefined };

  ProductList: undefined;
  CreateProduct: undefined;
  EditProduct: { docID: string | null | undefined };

  ShipSpareList: undefined;
  CreateShipSpare: undefined;
  EditShipSpare: { docID: string | null | undefined };

  PortList: undefined;
  CreatePort: undefined;
  EditPort: { docID: string | null | undefined };

  BankList: undefined;
  CreateBank: undefined;
  EditBank: { docID: string };

  CustomerSegmentationList: undefined;
  CreateCustomerSegmentation: undefined;
  EditCustomerSegmentation: {docID: string};

  CreateProcurement: undefined;
  ViewAllProcurement: undefined;
  ViewProcurementSummary: { docID: string };
  PreviewProcurement: { docID: string };

  CreatePurchaseOrderForm: { docID: string };
  EditPurchaseOrderForm: { docID: string };
  CreatePurchaseOrderSummary: { docID: string };
  ViewPurchaseOrderSummary: { docID: string };
  PreviewPurchaseOrder: { docID: string };
  ViewAllPurchaseOrder: undefined;

  CreatePurchaseVoucherForm: { docID: string };
  EditPurchaseVoucherForm: { docID: string };
  CreatePurchaseVoucherSummary: { docID: string };

  ViewAllPurchaseVoucher: undefined;
  ViewPurchaseVoucherSummary: { docID: string };

  CreateSparesProcurement: undefined;
  EditSparesProcurement: { docID: string };
  CreateSparesProcurementSummary: { docID: string };
  ViewAllSparesProcurement: undefined;
  ViewSparesProcurementSummary: { docID: string };
  PreviewSparesProcurementSummary: { docID: string };
  ViewSparesProcurementApprove: { docID: string };

  CreateSparesPurchaseOrder: { docID: string };
  EditSparesPurchaseOrder: { docID: string };
  CreateSparesPurchaseOrder2: { docID: string };
  CreateSparesPurchaseOrderSummary: { docID: string };
  ViewAllSparesPurchaseOrder: undefined;
  ViewSparesPurchaseOrderSummary: { docID: string };
  PreviewSparesPurchaseOrderSummary: { docID: string };
  CreateSparesPurchaseVoucherForm: { docID: string };
  EditSparesPurchaseVoucherForm: { docID: string };
  CreateSparesPurchaseVoucherSummary: { docID: string };
  ViewAllSparesPurchaseVoucher: undefined;
  ViewSparesPurchaseVoucherSummary: { docID: string };
}

