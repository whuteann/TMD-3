import { ShipSpare } from "../types/ShipSpare";


export const getShipSparesDescription = (shipSpares: Array<ShipSpare>) => {
  let shipSparesList: Array<string> = [];

  shipSpares.map((item) => {
    shipSparesList.push(item.product_description)
  })

  return { shipSparesList };
}