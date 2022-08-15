import { Currencies } from "../constants/Currency";
import { Bank } from "./Bank";
import { APPROVED, DRAFT, IN_REVIEW, REJECTED, REJECTING } from "./Common";
import { DateRange } from "./DateRange";
import { Product } from "./Product";
import { contactPerson, Supplier } from "./Supplier";
import { User } from "./User";

export type purchaseVoucherStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING;

export type PurchaseVoucher = {
  created_at: Date,
  created_by: User,

  secondary_id: string,
  revised_code: number,
  display_id: string,

  purchase_voucher_date: string,
  proforma_invoice_no: string,
  proforma_invoice_date: string,

  proforma_invoice_file: string,
  filename_storage_proforma: string,

  original_amount: string,
  account_purchase_by: Bank,
  cheque_no: string,
  paid_amount: string,
  status: purchaseVoucherStatuses,

  //po data
  purchase_order_id: string,
  purchase_order_secondary_id: string,
  supplier: Supplier,
  product: Product,
  unit_of_measurement: string,
  quantity: string,
  currency_rate: Currencies,
  unit_price: string,
  price_unit_of_measurement: string,
  payment_term: string,
  delivery_mode: string,
  delivery_mode_type: string,
  delivery_mode_details: string,
  port: string,
  delivery_location: string,
  contact_person: contactPerson,
  ETA_delivery_date: DateRange,
  remarks: string,

  do_file: string,
  filename_storage_do: string,
  brn_file: string,
  filename_storage_brn: string,

  reject_notes: string,
}