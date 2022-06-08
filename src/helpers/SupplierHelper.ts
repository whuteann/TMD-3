import { contactPerson, Supplier } from "../types/Supplier";

export const getSupplierNames = (suppliers: Array<Supplier>) => {
  let suppliersList: Array<string> = [];

  suppliers.map((item) => {
    suppliersList.push(item.name);
  })

  return { suppliersList }
}

export const getSupplierContactPersonsByName = (supplier: Supplier) => {
  let contactPersonsList: Array<contactPerson> = supplier.contact_persons;
  let contactPersonsNameList: Array<string> = [];

  contactPersonsList.map((item)=>{
    contactPersonsNameList.push(item.name);
  })

  return { contactPersonsList, contactPersonsNameList }
}