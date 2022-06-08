import { CustomerSegmentation } from "./CustomerSegmentation"

export type Customer = {
  id: string,
  secondary_id: string,
  name: string,
  address: string,
  contact_persons: Array<contactPerson>,
  fax: string,
  telephone: string,
  account_no: string,
  segmentation: CustomerSegmentation,
  credit_limit: string,
  status: "Active" | "Inactive",
  remarks: string,
  created_at: any,
}

export interface contactPerson {
  name: string,
  email: string,
  phone_number: string
}