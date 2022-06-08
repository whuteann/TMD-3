import { Port } from "../types/Port";

export const getPortNameAndDeliveryLocations = (ports: Array<Port>) => {
  let portList: Array<string> = [];
  let locationsList: Array<Array<string>> = [];

  ports.map(
    (item) => {
      let locations: Array<string> = [];
      portList.push(item.name);

      item.delivery_locations.map((delivery_location) => [
        locations.push(delivery_location.name)
      ])
      locationsList.push(locations);
    }
  )

  return { portList, locationsList }
}