import { Currencies } from "../constants/Currency";
import { Bank } from "./Bank";
import { Bunker } from "./Bunker";
import { APPROVED, DRAFT, IN_REVIEW, REJECTED, REJECTING } from "./Common";
import { ShipSpare } from "./ShipSpare";
import { contactPerson, Supplier } from "./Supplier";
import { User } from "./User";

export type purchaseVoucherStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING;

export type SparesPurchaseVoucher = {
  created_at: Date,
  created_by: User,
  
  secondary_id: string,
  revised_code: number,
  display_id: string,
  
  purchase_voucher_date: string,
  doNumber: string,
  invNumber: string,

  discount: string,
  total_payable: string,
  original_amount: string,
  account_purchase_by: Bank,
  cheque_no: string,
  paid_amount: string,
  status: purchaseVoucherStatuses,

  //po data
  spares_purchase_order_id: string,
  spares_purchase_order_secondary_id: string,
  supplier: Supplier,

  products: Array<{product: ShipSpare, sizing?: string, quantity: string, unit_of_measurement: string, unit_price: string}>,

  currency_rate: Currencies,
  payment_term: string,
  vessel_name: Bunker,
  type_of_supply: string,
  delivery_location: string,
  contact_person: contactPerson,
  ETA_delivery_date: string,
  remarks: string,
  
  reject_notes: string,
}