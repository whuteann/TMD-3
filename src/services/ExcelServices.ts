import { functions, rfqRef } from "../functions/Firebase";
import { Quotation } from "../types/Quotation";
import { RFQ } from "../types/RFQ";

export const generateSalesSummaryExcel = async (month: number, year: number, email: string, onSuccess: () => void, onError: (err: string) => void) => {

  const generateSalesExcelFunc = functions.httpsCallable('generateSalesSummaryExcel');

  const data = {
    month: month,
    year: year,
    email: email
  }

  generateSalesExcelFunc(data)
    .then((result) => {

      onSuccess();
    })
    .catch((err) => {
      onError(err.message);
    });

}

export const generateArchivedQuotationExcel = async (month: number, year: number, email: string, onSuccess: () => void, onError: (err: string) => void) => {

  const generateArchivedQuotationFunc = functions.httpsCallable('generateArchivedQuotationExcel');

  const data = {
    month: month,
    year: year,
    email: email
  }

  generateArchivedQuotationFunc(data)
    .then((result) => {

      onSuccess();
    })
    .catch((err) => {
      onError(err.message);
    });

}

// export const buildExcel = (data: Array<Quotation>) => {
//   let most_products: number = 1;
//   let most_ports: number = 1;
//   let sheet_content: Array<Array<string>> = [];

//   getRFQs((rfqReasons) => {
//     data.map(quo => {
//       let quotation_row: Array<string> = [];
//       let products: Array<string> = [];
//       let ports: Array<string> = [];

//       let rfq_reason = rfqReasons.find(element => element.reason === quo.reject_reason)

//       quo.products.map((product, index) => {
//         let prices: string = ""
//         product.prices.map((price, index) => {
//           if (index == 0) {
//             prices = `${price.value} ${price.unit}`;
//           } else {
//             prices = `${price.value} ${price.unit}, ${prices}`;
//           }
//         })
//         products = products.concat([product.product.name, prices])
//         if (index + 1 > most_products) {
//           most_products = most_products + 1;
//         }
//       })

//       quo.ports.map((port, index) => {
//         ports = ports.concat([`${port.port}, ${port.delivery_location}`])
//         if (index + 1 > most_ports) {
//           most_ports = most_ports + 1;
//         }
//       })

//       quotation_row = [quo.display_id, quo.customer?.name!]
//         .concat(products)
//         .concat([quo.barging_fee])
//         .concat(ports)
//         .concat([quo.payment_term, quo.currency_rate, quo.conversion_factor || "-", quo.validity_date, quo.validity_time, quo.reject_notes || "-", rfq_reason.code, rfq_reason.reason])

//       sheet_content.push(quotation_row);
//     })


//   }, () => { })
// }

export const getRFQs = (onSuccess: (quo: Array<any>) => void, onError: (error?: string) => void) => {
  rfqRef.where('deleted', '==', false)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        onError('Empty');
        return;
      }
      return onSuccess(snapshot.docs.map(item => { return item.data() }));
    });
}