import { Currencies } from "../constants/Currency";
import { Bank } from "./Bank";
import { Bunker } from "./Bunker";
import { APPROVED, DRAFT, IN_REVIEW, REJECTED } from "./Common";
import { contactPerson, Customer } from "./Customer";
import { DateRange } from "./DateRange";
import { Product } from "./Product";
import { User } from "./User";

export type invoiceStatuses = typeof IN_REVIEW | typeof DRAFT | typeof APPROVED | typeof REJECTED;

export type Invoice = {
  secondary_id: string,
  revised_code?: number,
  display_id: string,

  invoice_date: string,
  do_no?: string,
  purchase_order_no?: string,
  payment_term?: string,
  bunker_barges?: Array<Bunker>,

  customer_name: string,
  customer: Customer,

  barging_fee?: string,
  barging_remark?: string,
  attention_pic?: contactPerson,
  currency_rate?: Currencies,
  products: Array<{
    product: Product,
    BDN_quantity: { quantity: string, unit: string },
    quantity: string,
    unit: string,
    price: { value: string, unit: string, remarks: string },
    subtotal: string,
    MOPS?: boolean,
  }>,
  subtotal?: string,
  discount?: string,
  total_payable?: string,

  quotation_secondary_id?: string,
  delivery_location?: string,
  delivery_date?: DateRange,
  delivery_mode?: string,
  contract?: string,

  bank_details?: Bank,
  notes?: string,
  job_confirmation_id?: string,
  job_confirmation_secondary_id?: string,
  receiving_vessel_name: string,
  status?: invoiceStatuses,
  receipts?: Array<{ id: string, secondary_id: string }>
  created_at?: Date,
  created_by?: User,
  reject_notes?: string,

  sales_confirmation_secondary_id: string,
  sales_id?: string,
}
