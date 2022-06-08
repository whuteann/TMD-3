import { Customer } from "./Customer"

export type Sales = {
  created_date: string,
  created_at: Date,

  customer: Customer,  

  quotation_id: string,
  sales_id: string,
  job_id: string,
  invoice_id: string,
  receipt_id: string,
}