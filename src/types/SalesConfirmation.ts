import { Bunker } from "./Bunker";
import { CONFIRMED, NOT_CONFIRMED } from "./Common";
import { Customer } from "./Customer";
import { DateRange } from "./DateRange";
import { Product } from "./Product";
import { User } from "./User";
import { Moment, MomentLongDateFormat, MomentSetObject } from "moment";
import { Currencies } from "../constants/Currency";

export type salesConfirmationStatuses = typeof CONFIRMED | typeof NOT_CONFIRMED;

export type SalesConfirmation = {
  secondary_id: string,
  quotation_id: string,
  quotation_secondary_id: string,
  quotation_date?: string,
  confirmed_date: string,
  customer: Customer,
  products: Array<{ product: Product, unit: string, quantity: string, price: { value: string, unit: string, remarks: string } }>
  port?: string,
  delivery_location?: string,
  delivery_date?: DateRange,
  delivery_mode?: string,
  remarks?: string,
  remarks_OT?: string,
  currency_rate: Currencies,
  barging_fee: string,
  barging_remark: string,
  conversion_factor: string,
  payment_term: string,
  receiving_vessel_name: string,
  validity_date: string,
  validity_time: string,
  bunker_barges: Array<Bunker>,

  purchase_order_no?: string,
  purchase_order_file?: string,
  filename_storage?: string,

  conditions?: string,
  surveyor_contact_person?: string,
  receiving_vessel_contact_person?: Array<string>,
  created_at?: Moment,
  created_by?: User,
  status?: salesConfirmationStatuses,
  sales_id: string,
}