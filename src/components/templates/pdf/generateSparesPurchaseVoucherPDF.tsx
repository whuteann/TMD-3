import { convertCurrencyText } from "../../../constants/Currency";
import { addCommaNumber } from "../../../helpers/NumericHelper";
import { SparesPurchaseVoucher } from "../../../types/SparesPurchaseVoucher";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";
var converter = require('number-to-words');

export const generateSparesPurchaseVoucherPDF = (data: SparesPurchaseVoucher, image) => {

  let productList: string = "";

  data.products.map((item, index) => {

    if (index == 0) {
      productList = `
      <div style="display: flex; flex-direction: row; margin-top: 10px;  width: 100%;">
        <div style="display: flex; flex-direction: row; width: 33.3333333%;">
          <div style=" width: 30%">${data.supplier.account_no || "-"}</div>
          <div style="width: 70%;">${data.supplier.name}</div>
        </div>
        <div style="width: 33.3333333%;">
          <div style="padding-left: 10%;">
            ${data.products[index].product.product_description}
          </div>
        </div>
        <div style="width: 33.3333333%; ">
          <div style="padding-left: 10%;">
            ${addCommaNumber(data.paid_amount, "0")}
          </div>
        </div>
      </div>
      `
    } else {
      productList = `
      ${productList}
      <div style="display: flex; flex-direction: row; margin-top: 10px;  width: 100%;">
        <div style="display: flex; flex-direction: row; width: 33.3333333%;">
        </div>
        <div style="width: 33.3333333%;">
          <div style="padding-left: 10%;">
            ${data.products[index].product.product_description}
          </div>
        </div>
        <div style="width: 33.3333333%; ">
        </div>
      </div>
    `
    }
  })

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

        <div>
          <div style="text-align: right; font-size: 15px; width: 100%;">
            <b>Purchase Voucher No.: ${data?.display_id}</b>
          </div>

          <div style="display:flex; flex-direction: row; padding-top: 10px; ">
            <div style="width: 65%;">
              <div style="display: flex; flex-direction: row">
                <div style=" width: 15%">Pay To: </div>
                <div style="width: 5%">:</div>
                <div style="width: 55%;"> ${data.supplier.name}</div>
              </div>
              <div style="width: 100%">
                <div style="padding-left: 20%; width: 55%;"> 
                  ${data.supplier.address}
                </div>
              </div>
            </div>

            <div style="width: 35%; align-items: flex-end;">
              <div style="display: flex; flex-direction: row;">
                <div style="width: 45%;">Date: </div>
                <div style="width: 5%">:</div>
                <div style="width: 50%;">  ${data.purchase_voucher_date}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style="width: 45%;">Received In: </div>
                <div style="width: 5%">:</div>
                <div style="width: 50%;">  ${data.account_purchase_by.name ? data.account_purchase_by.name : "-"}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style="width: 45%;">Cheque No.: </div>
                <div style="width: 5%">:</div>
                <div style="width: 50%;">  ${data.cheque_no ? data.cheque_no : "-"}</div>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 25px; width: 100%;">
            <div style="width: 33.3333333%; border: 1px solid #000000; border-left: none">
              <div style="padding-left: 10%;">A/C</div>
            </div>
            <div style="width: 33.3333333%; border: 1px solid #000000; ">
              <div style="padding-left: 10%;">Description</div>
            </div>
            <div style="width: 33.3333333%; border: 1px solid #000000; border-right: none">
              <div style="padding-left: 10%;">Amount(RM)</div>
            </div>
          </div>
          
          ${productList}

          <div style="display: flex; flex-direction: row; margin-top: 25px; width: 85%;">
            <div style="width: 30%; border: 1px solid #000000; border-left: none">
              <div style="padding-left: 10%;">Doc No.</div>
            </div>
            <div style="width: 20%; border: 1px solid #000000; ">
              <div style="padding-left: 10%;">Doc Date</div>
            </div>
            <div style="width: 25%; border: 1px solid #000000;">
              <div style="padding-left: 10%;">Org. Amt</div>
            </div>
            <div style="width: 25%; border: 1px solid #000000; border-right: none">
                <div style="padding-left: 10%;">Paid Amt</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: row; margin-top: 10px; height: 350px; width: 85%;">
            <div style="width: 30%; ">${data.secondary_id}</div>
            <div style="width: 20%; ">
              <div style="padding-left: 10%;">${data.purchase_voucher_date}</div>
            </div>
            <div style="width: 25%; ">
              <div style="padding-left: 10%;">${addCommaNumber(data.original_amount, "0")}</div>
            </div>
            <div style="width: 25%; ">
              <div style="padding-left: 10%;">${addCommaNumber(data.paid_amount, "0")}</div>
            </div>
          </div>

          <div style="border: 1px solid #000000; width: 100%;"></div>
          <div style="display: flex; flex-direction: row; margin-top: 10px;">
            <div style="width: 80%; display: flex; flex-direction: row;">
              <div style=" width: 15%; font-size: 13px;">${convertCurrencyText(data.currency_rate)}</div>
              <div style="width: 5%">:</div>
              <div style="width: 80%; font-size: 13px; ">${converter.toWords(Number(data.paid_amount)).toUpperCase()} ONLY</div>
            </div>
            <div style="width: 20%;  display: flex; flex-direction: column; align-items: flex-end;">
              <div style="display: flex; flex-direction: row;">
                <div style="font-size: 13px;">Total: </div>
                <div style="font-size: 13px; margin-left: 5px;"><b> ${addCommaNumber(data.paid_amount, "0")}</b> </div>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 90px; width: 100%">
            <div style="width: 26.66666666666667%;">
              <div style="border: 1px solid #000000; "></div>
              <div style=" padding-left: 45px;">Prepared By</div>
            </div>
            <div style="width: 26.66666666666667%; margin-left: 10%;">
              <div style="border: 1px solid #000000; "></div>
              <div style=" padding-left: 45px;">Approved By</div>
            </div>
            <div style="width: 26.66666666666667%; margin-left: 10%;">
              <div style="border: 1px solid #000000;"></div>
              <div style=" padding-left: 45px;">Received By</div>
            </div>
            
          </div>

        </div>
      </div>
    </body>
  </html>
`

  return htmlContent;
}