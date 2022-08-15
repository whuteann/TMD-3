import { APPROVED, DRAFT, IN_REVIEW, PENDING, REJECTED, REJECTING, SUBMITTED } from "./Common";
import { DateRange } from "./DateRange";
import { ShipSpare } from "./ShipSpare";
import { Supplier } from "./Supplier"
import { User } from "./User";

export type spareProcurementStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING | typeof PENDING | typeof SUBMITTED;

export type SparesProcurement = {
  secondary_id: string,
  revised_code: number,
  display_id: string,
  
  procurement_date: string,
  suppliers: Array<SupplierField>,
  products: Array<{product: ShipSpare, sizing?: string, quantity: string, unit_of_measurement: string}>,
  proposed_date: DateRange,
  remarks: string,
  status: spareProcurementStatuses,
  reject_notes: string,
  spares_purchase_order_id: string,
  spares_purchase_order_secondary_id: string,
  created_at: Date,
  created_by: User
}

export type SupplierField = {
  supplier: Supplier,
  quotation_no: string,
  filename: string,
  filename_storage: string,
}