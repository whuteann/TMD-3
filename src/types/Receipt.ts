import { Moment } from "moment";
import { Currencies } from "../constants/Currency";
import { Bank } from "./Bank";
import { Customer } from "./Customer";
import { Product } from "./Product";
import { User } from "./User";

export type Receipt = {
  secondary_id: string,
  revised_code: number,
  display_id: string,
  currency_rate: Currencies,
  receipt_date: string,
  invoice_date: string,
  invoice_id?: string,
  invoice_secondary_id: string,
  account_received_in?: Bank,
  barging_fee?: string,
  barging_remark?: string,
  cheque_number?: string,
  customer?: Customer,

  products: Array<{ product: Product, BDN_quantity: { quantity: string, unit: string }, quantity: string, unit: string, price: { value: string; unit: string; }, subtotal: string }>,
  discount: string,
  total_payable: string,
  amount_received?: string,
  created_at?: Moment,
  created_by?: User,
}