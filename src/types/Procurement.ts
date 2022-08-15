import { Currencies } from "../constants/Currency";
import { PENDING, REQUESTING, SUBMITTED } from "./Common";
import { DateRange } from "./DateRange";
import { EX_PIPE_LINE, LORRY_TANKER, SHIP_TO_SHIP, TRADER } from "./DeliveryModes";
import { Product } from "./Product";
import { Supplier } from "./Supplier";
import { User } from "./User";

export type procurementStatuses = typeof PENDING | typeof REQUESTING | typeof SUBMITTED;

export type Procurement = {
  secondary_id: string,
  revised_code: number,
  display_id: string,

  procurement_date: string,
  supplier: Supplier,
  product: Product,
  unit_of_measurement: string,
  quantity: string,
  proposed_date: DateRange,
  status: procurementStatuses,
  purchase_order_id: string,
  purchase_order_secondary_id: string,
  created_at: Date,
  created_by: User,
  currency_rate: Currencies,
  delivery_mode: typeof LORRY_TANKER | typeof TRADER | typeof SHIP_TO_SHIP | typeof EX_PIPE_LINE;
  unit_price: string,
  price_unit_of_measurement: string,
  payment_term: string,
  total_amount: string,
}