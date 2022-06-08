
export type Supplier = {
  id: string,
  secondary_id: string,
  name: string,
  address: string,
  contact_persons: Array<contactPerson>,
  telephone: string,
  year: string,
  email: string,
  product: string,
  account_no: string,
  remark: string,
  status: string,
  created_at: any,
}

export interface contactPerson {
  name: string,
  email: string,
  phone_number: string
}