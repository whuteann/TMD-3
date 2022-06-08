import { Bunker } from "../types/Bunker";

export const getBunkerNameList = (bunkers: Array<Bunker>) => {
  let bunkerList: Array<string> = [];

  bunkers.map(
    (item) => {
      bunkerList.push(item.name);
    }
  )

  return { bunkerList }
}