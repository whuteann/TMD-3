import { Currencies } from "../constants/Currency";
import { Bunker } from "./Bunker";
import { APPROVED, APPROVED_DOC, DRAFT, DOC_SUBMITTED, IN_REVIEW, NO_PURCHASE_VOUCHER, PV_ISSUED, PV_PENDING, REJECTED, REJECTING, VERIFIED, VERIFIED_DOC } from "./Common";
import { ShipSpare } from "./ShipSpare";
import { contactPerson, Supplier } from "./Supplier"
import { User } from "./User";

export type sparesPurchaseOrderStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING | typeof VERIFIED | typeof DOC_SUBMITTED | typeof VERIFIED_DOC | typeof APPROVED_DOC | typeof NO_PURCHASE_VOUCHER | typeof PV_ISSUED | typeof PV_PENDING;

export type SparesPurchaseOrder = {
  purchase_order_date: string,

  secondary_id: string,
  revised_code: number,
  display_id: string,

  supplier: Supplier,
  product: ShipSpare,
  quantity: string,
  unit_of_measurement: string,
  proposed_date: string,
  currency_rate: Currencies,
  unit_price: string,
  payment_term: string

  spares_procurement_id: string,
  spares_procurement_secondary_id: string,
  total_amount: string,
  type_of_supply: string,
  vessel_name: Bunker,
  port: string,
  delivery_location: string,
  contact_person: contactPerson,
  ETA_delivery_date: string,
  remarks: string,
  status: sparesPurchaseOrderStatuses,

  spares_purchase_voucher_id: string,
  spares_purchase_voucher_secondary_id: string,
  spares_purchase_vouchers?: Array<{ id: string, secondary_id: string }>,

  reject_notes: string,

  doFile: string,
  doNumber: string,
  filename_storage_do: string,
  invFile: string,
  invNumber: string,
  filename_storage_inv: string,

  created_at: Date,
  created_by: User,

}