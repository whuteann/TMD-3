import { Currencies } from "../constants/Currency";
import { Bunker } from "./Bunker";
import { ISSUED_INV, NO_INVOICE } from "./Common";
import { Customer } from "./Customer";
import { DateRange } from "./DateRange";
import { Product } from "./Product";
import { User } from "./User";

export type jobConfirmationStatuses = typeof NO_INVOICE | typeof ISSUED_INV;

export type JobConfirmation = {
  secondary_id: string,
  quotation_id: string,
  quotation_secondary_id: string,
  invoice_secondary_id?: string,
  invoice_id?: string,
  confirmed_date: string,
  customer?: Customer,
  products: Array<{ product: Product, unit: string, quantity: string, price: { value: string, unit: string, remarks: string } }>,
  
  barging_fee?: string,
  barging_remark?: string,
  barging_unit?: string,

  port?: string,
  delivery_location?: string,
  delivery_date?: DateRange,
  delivery_mode: string,
  currency_rate: Currencies,
  payment_term: string,
  remarks?: string,
  remarks_OT?: string,
  conditions?: string,
  surveyor_contact_person?: string,
  receiving_vessel_name?: string,
  bunker_barges: Array<Bunker>,

  purchase_order_no?: string,
  purchase_order_file?: string,
  filename_storage_po?: string,

  bdn_file?: string,
  filename_storage_bdn?: string,

  status: jobConfirmationStatuses,
  receiving_vessel_contact_person?: string[],
  contact_person: string,
  invoice_status?: string,
  created_at: Date,
  created_by: User,

  sales_confirmation_secondary_id: string,
  sales_id: string,
}