import { Customer } from "../types/Customer";

export function getCustomerNameAndContactPerson(customers: Array<Customer>) {
  let nameList: Array<string> = [];
  let contactPerson: Array<string> = [];
  customers.map(
    (item) => {
      nameList.push(item.name);
      contactPerson.push(item.contact_persons[0].name);
    });

  return { nameList, contactPerson };
}