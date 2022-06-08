import { convertCurrency, convertCurrencyText } from "../../../constants/Currency";
import { pickBetween } from "../../../helpers/GenericHelper";
import { addCommaNumber } from "../../../helpers/NumericHelper";
import { Receipt } from "../../../types/Receipt";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";
var converter = require('number-to-words');

export const generateOfficialReceiptPDF = (data: Receipt, image) => {


  var htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <title>Pdf Content</title>
          <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
          <style>
            ${CSSStyles}
          </style>
      </head>
      <body>
        ${documentHeader(image)}
        <div class="main" style="line-height: 20px">

          <div style="display: flex; flex-direction: column;">
            <div style="text-align: right; font-size: 15px">
              <b>Official Receipt No.: ${data?.display_id}</b>
            </div>

            <div style="display:flex; flex-direction: row; padding-top: 10px; ">
              
              <div style="display:flex; flex-direction: column; width: 55%;">
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 30%">Received From: </div>
                  <div style="width: 5%">:</div>
                  <div style="width: 65%;">${data.customer?.name}</div>
                </div>
                <div style="margin-left: 35%;">${data.customer?.address}</div>
              </div>

              <div style="width: 45%;">
                <div style="padding-left: 25%; width: 75%;">
                  <div style="display: flex; flex-direction: row;">
                    <div style=" width: 40%;">Date: </div>
                    <div style="width: 5%;">:</div>
                    <div style="width: 55%;">  ${data?.receipt_date}</div>
                  </div>
                  <div style="display: flex; flex-direction: row">
                    <div style=" width: 40%;">Received In: </div>
                    <div style="width: 5%;">:</div>
                    <div style="width: 55%;">  ${data?.account_received_in?.name}</div>
                  </div>
                  <div style="display: flex; flex-direction: row">
                    <div style=" width: 40%;">Cheque No.</div>
                    <div style="width: 5%;">:</div>
                    <div style="width: 55%;">  ${data?.cheque_number}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: row; margin-top: 25px;">
              <div style="width: 40%; border: 1px solid #000000; padding-left: 20px; border-left: none">A/C</div>
              <div style="width: 40%; border: 1px solid #000000; padding-left: 20px;">Description</div>
              <div style="width: 20%; border: 1px solid #000000; padding-left: 20px; border-right: none"> Amount(${convertCurrency(data.currency_rate)})</div>
            </div>

            <div style="display: flex; flex-direction: row; margin-top: 4px; width: 100%;">
              <div style="display: flex; flex-direction: row; width: 40%;">
                <div style="width: 35%;">${data.customer?.account_no}</div>
                <div style="width: 65%;">${data.customer?.name}</div>
              </div>
              <div style="width: 40%;">
                <div style="padding-left: 15px;">
                  ${data.products.map((item, index) => { if (index + 1 == data.products.length) { return `${item.product.name}/ ${item.BDN_quantity.quantity} ${item.BDN_quantity.unit}` } else { return `${item.product.name}/ ${item.BDN_quantity.quantity} ${item.BDN_quantity.unit}, ` } })}
                </div>
              </div>
              <div style="width: 20%;">
                <div style="padding-left: 10%;">
                  ${addCommaNumber(data?.total_payable, "0")}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: row; margin-top: 14px">
              <div style="width: 20%; border: 1px solid #000000;  border-left: none">
                <div style="padding-left: 15px;">  
                  Doc No.
                </div>
              </div>
              <div style="width: 20%; border: 1px solid #000000;  ">
                <div style="padding-left: 15px;">
                  Doc Date
                </div>
              </div>
              <div style="width: 20%; border: 1px solid #000000; ">
                <div style="padding-left: 15px;">
                  Org. Amt
                </div>
              </div>
              <div style="width: 20%; border: 1px solid #000000; border-right: none">
                <div style="padding-left: 15px;">
                  Paid Amt
                </div>
              </div>
            </div>
            <div style="display: flex; flex-direction: row; margin-top: 4px; height: 450px; width: 100%; ">
              <div style="width: 20%;">
                <div style="padding-left: 15px;">
                  ${addCommaNumber(data?.total_payable, "0")}
                </div>
              </div>
              <div style="width: 20%;">
                <div style="padding-left: 15px;">
                  ${data?.invoice_date}
                </div>
              </div>
              <div style="width: 20%;">
                <div style="padding-left: 15px;">
                  ${addCommaNumber(data?.total_payable, "0")} 
                  </div>
              </div>
              <div style="width: 20%;">
                <div style="padding-left: 15px;">
                  ${addCommaNumber(data.amount_received, "0")}
                </div>
              </div>
            </div>

            <div style="border: 1px solid #000000; width: 100%;"></div>
            <div style="display: flex; flex-direction: row; margin-top: 10px;">
              <div style=" width: 15%; ">${convertCurrencyText(data.currency_rate)}: </div>
              <div style="width: 60%;">
                <div style="padding-left: 5%;">
                  ${converter.toWords(data.amount_received).toUpperCase()} ONLY
                </div>
              </div>
              <div style="width: 25%;">
                <div style="padding-left: 20%; display: flex; flex-direction: row;">
                  <div style=" width: 30%;">Total: </div>
                  <div style=" width: 70%;"><b>${addCommaNumber(data.amount_received, "0")}</b> </div>
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: row;">
              <div style="display: flex; flex-direction: column; margin-top: 50px; width: 60%;">
                <div>N.B.</div>
                <div>Validity of This Receipt</div>
                <div>Subject to Clearing of Cheque.</div>
              </div>

              <div style="display: flex; flex-direction: column; width: 40%; margin-top: 60px;">
                <div style="border: 1px solid #000000;"></div>
                <div style="margin-top: 5px;">For TUMPUAN MEGAH DEVELOPMENT SDN BHD</div>
              </div>

            </div>
          </div>
        </div>
      </body>
    </html>
  `

  return htmlContent;
}