import { Currencies } from "../constants/Currency";
import { Bunker } from "./Bunker";
import { APPROVED, DRAFT, IN_REVIEW, NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, REJECTED, REJECTING } from "./Common";
import { DateRange } from "./DateRange";
import { Product } from "./Product"
import { contactPerson, Supplier } from "./Supplier"
import { User } from "./User";

export type purchaseOrderStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING | typeof NO_PURCHASE_VOUCHER | typeof PV_ISSUED | typeof PV_PENDING;

export type PurchaseOrder = {
  purchase_order_date: string,

  secondary_id: string,
  revised_code: number,
  display_id: string,

  supplier: Supplier,
  product: Product,
  quantity: string,
  unit_of_measurement: string,
  proposed_date: string,
  currency_rate: Currencies,
  unit_price: string,
  price_unit_of_measurement: string,
  payment_term: string,
  vessel_name: Bunker,

  procurement_id: string,
  procurement_secondary_id: string,
  total_amount: string,
  delivery_mode: string,
  delivery_mode_type: string,
  delivery_mode_details: string,

  port: string,
  delivery_location: string,
  contact_person: contactPerson,
  ETA_delivery_date: DateRange,
  remarks: string,
  status: purchaseOrderStatuses,

  balance_owing: string,
  purchase_vouchers?: Array<{ id: string, secondary_id: string, paid_amount: string }>

  reject_notes: string,
  created_at: Date,
  created_by: User,
}