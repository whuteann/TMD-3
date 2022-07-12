import { LinkingOptions } from "@react-navigation/native";
import { RootRoutes } from "./NavigationProps/NavigationProps";

export const linking: LinkingOptions<RootRoutes> = {
  prefixes: ['http://localhost:19006/'],
  config: {
    screens: {
      Login: '/login',
      ForgetPassword: '/forget-password',
      Dashboard: "/dashboard",
      Profile: "/profile",
      InvalidEmail: "/invalid-email",
      CreateQuotation: {
        path: "/quotations/create",
      },
      EditQuotation: {
        path: "/quotations/:docID?/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateQuotation2: {
        path: "/quotations/:docID/:action/cont",
        parse: {
          action: action => action,
          docID: docID => docID,
        },
      },
      CreateQuotationSummary: {
        path: "/quotations/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewQuotationSummary: {
        path: "/quotations/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      ProceedSalesConfirmation: {
        path: "/sales-confirmation/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      ProceedSalesConfirmationFinal: {
        path: "/sales-confirmation/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllQuotation: "/quotations",


      ViewAllSalesConfirmation: "/sales-confirmation",
      SalesConfirmationSummary: {
        path: "/sales-confirmation/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      Departments: "/departments",

      CreateUser: "/users/create",

      EditUser: {
        path: "/users/edit/:docID",
        parse: {
          docID: docID => docID,
        },
      },

      ViewAllJobConfirmation: "/job-confirmations",
      JobConfirmationSummary: {
        path: "/job-confirmations/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },

      CreateInvoice: {
        path: "/invoices/:docID?/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditInvoice: {
        path: "/invoices/:docID?/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateInvoice2: {
        path: "/invoices/:docID/edit/cont",
        parse: {
          docID: docID => docID,
        },
      },
      CreateInvoiceSummary: {
        path: "/invoices/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },

      ViewAllInvoice: "/invoices",
      ViewInvoiceSummary: {
        path: "/invoices/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      PreviewInvoiceSummary: {
        path: "/invoices/:docID/preview",
        parse: {
          docID: docID => docID,
        },
      },

      CreateOfficialReceipt: {
        path: "/receipts/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditOfficialReceipt: {
        path: "/receipts/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateReceiptSummary: {
        path: "/receipts/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewReceiptSummary: {
        path: "/receipts/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllReceipt: {
        path: "/receipts",
      },

      CustomerList: {
        path: "/customers"
      },
      CreateCustomer: {
        path: "/customers/create"
      },
      EditCustomer: {
        path: "/customers/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CustomerDetail: {
        path: "/customers/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      SupplierList: {
        path: "/suppliers"
      },
      CreateSupplier: {
        path: "/suppliers/create"
      },
      EditSupplier: {
        path: "/suppliers/:docID/edit",
        parse: {
          docID: docID => docID,
        }
      },
      UpdateContactList: {
        path: "/update-contact-list/:docID",
        parse: {
          docID: docID => docID,
        },
      },
      UnawardedRFQList: {
        path: "/unawarded-rfqs",
        parse: {
          docID: docID => docID,
        },
      },
      CreateUnawardedRFQ: {
        path: "/unawarded-rfqs/create"
      },
      EditUnawardedRFQ: {
        path: "/unawarded-rfqs/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      BunkerBargeList: {
        path: "/bunker-barges"
      },
      CreateBunker: {
        path: "/bunker-barges/create"
      },
      EditBunker: {
        path: "/bunker-barges/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      BunkerDetail: {
        path: "/bunker-barges/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      ProductList: {
        path: "/products"
      },
      CreateProduct: {
        path: "/products/create"
      },
      EditProduct: {
        path: "/products/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      ShipSpareList: {
        path: "/ship-spares"
      },
      CreateShipSpare: {
        path: "/ship-spares/create"
      },
      EditShipSpare: {
        path: "/ship-spares/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      
      CustomerSegmentationList: {
        path: "/customer-segmentation"
      },
      CreateCustomerSegmentation: {
        path: "/customer-segmentation/create"
      },
      EditCustomerSegmentation: {
        path: "/customer-segmentation/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },


      BankList: {
        path: "/banks"
      },
      CreateBank: {
        path: "/banks/create"
      },
      EditBank: {
        path: "/banks/edit/:docID",
        parse: {
          docID: docID => docID,
        },
      },
      PortList: {
        path: "/ports"
      },
      CreatePort: {
        path: "/ports/create"
      },
      EditPort: {
        path: "/ports/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },

      // Procurement
      CreateProcurement: {
        path: "/procurements/create",
      },
      ViewAllProcurement: {
        path: "/procurements",
      },
      ViewProcurementSummary: {
        path: "/procurements/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      PreviewProcurement: {
        path: "/procurements/:docID/preview",
        parse: {
          docID: docID => docID,
        },
      },

      CreatePurchaseOrderForm: {
        path: "/purchase-orders/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditPurchaseOrderForm: {
        path: "/purchase-orders/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreatePurchaseOrderSummary: {
        path: "/purchase-orders/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllPurchaseOrder: {
        path: "/purchase-orders",
      },
      ViewPurchaseOrderSummary: {
        path: "/purchase-orders/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      PreviewPurchaseOrder: {
        path: "/purchase-orders/:docID/preview",
        parse: {
          docID: docID => docID,
        },
      },
      CreatePurchaseVoucherForm: {
        path: "/purchase-vouchers/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditPurchaseVoucherForm: {
        path: "/purchase-vouchers/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreatePurchaseVoucherSummary: {
        path: "/purchase-vouchers/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllPurchaseVoucher: {
        path: "/purchase-vouchers",
      },
      ViewPurchaseVoucherSummary: {
        path: "/purchase-vouchers/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },

      CreateSparesProcurement: {
        path: "/spares-procurements/create",
      },
      EditSparesProcurement: {
        path: "/spares-procurements/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesProcurementSummary: {
        path: "/spares-procurements/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllSparesProcurement: {
        path: "/spares-procurements",
      },
      ViewSparesProcurementSummary: {
        path: "/spares-procurements/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      PreviewSparesProcurementSummary: {
        path: "/spares-procurements/:docID/preview",
        parse: {
          docID: docID => docID,
        },
      },
      ViewSparesProcurementApprove: {
        path: "/spares-procurements/:docID/approve",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesPurchaseOrder: {
        path: "/spares-purchase-orders/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditSparesPurchaseOrder: {
        path: "/spares-purchase-orders/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesPurchaseOrder2: {
        path: "/spares-purchase-orders/:docID/edit/cont",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesPurchaseOrderSummary: {
        path: "/spares-purchase-orders/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllSparesPurchaseOrder: {
        path: "/spares-purchase-orders"
      },
      ViewSparesPurchaseOrderSummary: {
        path: "/spares-purchase-orders/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      PreviewSparesPurchaseOrderSummary: {
        path: "/spares-purchase-orders/:docID/preview",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesPurchaseVoucherForm: {
        path: "/spares-purchase-vouchers/:docID/create",
        parse: {
          docID: docID => docID,
        },
      },
      EditSparesPurchaseVoucherForm: {
        path: "/spares-purchase-vouchers/:docID/edit",
        parse: {
          docID: docID => docID,
        },
      },
      CreateSparesPurchaseVoucherSummary: {
        path: "/spares-purchase-vouchers/:docID/summary",
        parse: {
          docID: docID => docID,
        },
      },
      ViewAllSparesPurchaseVoucher: {
        path: "/spares-purchase-vouchers"
      },
      ViewSparesPurchaseVoucherSummary: {
        path: "/spares-purchase-vouchers/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },

      Sales: {
        path: "/sales",
      },
      SalesSummary: {
        path: "/sales/:docID/show",
        parse: {
          docID: docID => docID,
        },
      },
      Settings: {
        path: "/settings",
      },
    }
  }
};

