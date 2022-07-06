import { Bunker } from "./Bunker";
import { Customer } from "./Customer";
import { IN_REVIEW, DRAFT, APPROVED, REJECTED, CONFIRMED, ARCHIVED, REJECTING } from "./Common";
import { Product } from "./Product";
import { DateRange } from "./DateRange";
import { User } from "./User";
import { Currencies } from "../constants/Currency";

export type quotationStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED | typeof REJECTING | typeof CONFIRMED | typeof ARCHIVED;

export type Quotation = {
  //page 1
  secondary_id: string,
  revised_code: number,
  display_id: string,

  quotation_date: string,
  customer?: Customer,
  
  products: Array<{
    product: Product,
    quantity: string,
    unit: string,
    prices: Array<{ value: string, unit: string, remarks: string }>
  }>,

  ports: Array<{ port: string, delivery_location: string }>

  
  bunker_barges?: Array<Bunker>
  delivery_date?: DateRange,
  delivery_modes?: Array<string>,
  receiving_vessel_name?: string,
  remarks?: string,

  //page 2
  currency_rate: Currencies,
  barging_fee: string,
  barging_remark: string,
  conversion_factor: string,
  payment_term: string,
  validity_date: string,
  validity_time: string,

  contact_person?: string,
  status?: quotationStatuses,

  //approved
  purchase_order_no?: string,
  purchase_order_file?: string,
  filename_storage?: string,

  //rejected
  reject_notes?: string,
  reject_reason?: string,

  //After confirmation
  sales_confirmation_id?: string,
  sales_confirmation_secondary_id?: string,
  confirmed_date?: string,
  job_confirmation_id?: string,

  created_at?: Date,
  deleted_at?: Date,
  created_by: User

  document_code?: number,
  sales_id: string,
}