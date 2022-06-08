
export type Port = {
  id: string,
  secondary_id: string,
  name: string,
  delivery_locations: Array<deliveryLocation>
}

export interface deliveryLocation {
  name: string
}