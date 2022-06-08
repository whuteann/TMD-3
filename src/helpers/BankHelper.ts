import { Bank } from "../types/Bank";

export const getBankNameList = (banks: Array<Bank>) => {
  let bankList: Array<string> = [];

  banks.map((item) => {
    bankList.push(item.name);
  })

  return { bankList }
}