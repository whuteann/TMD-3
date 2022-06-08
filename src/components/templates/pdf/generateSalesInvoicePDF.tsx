import { convertCurrency, convertCurrencyText } from "../../../constants/Currency";
import { pickBetween } from "../../../helpers/GenericHelper";
import { addCommaNumber } from "../../../helpers/NumericHelper";
import { Invoice } from "../../../types/Invoice";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";
var converter = require('number-to-words');

export const generateSalesInvoicePDF = (data: Invoice, image) => {
  var totalPrice: number = data.barging_fee ? Number(data.barging_fee) : 0;
  var bunkersList = "";
  var productsList = "";

  data.products.map((product, index) => {
    totalPrice += parseInt(product.subtotal);

    productsList = productsList +
      `
      <div style="display: flex; flex-direction: row">
        <div style="width: 10%;  ">${index + 1}</div>
        <div style="width: 40%; ">${product.product.name}</div>
        <div style="width: 16.6666%; ">${product.BDN_quantity.quantity}/ ${product.BDN_quantity.unit}</div>
        <div style="width: 16.6666%; ">${product.price.value}/ ${product.price.unit} </div>
        <div style="width: 16.6666%; text-align: right;">${addCommaNumber(product.subtotal, "0")}</div>
      </div>
      `;

    if (index == (data.products.length - 1)) {
      if (data.barging_fee) {
        productsList = productsList +
          `
        <div style="display: flex; flex-direction: row">
          <div style="width: 10%;  ">${index + 2}</div>
          <div style="width: 40%; ">Barging fee</div>
          <div style="width: 16.6666%; ">--</div>
          <div style="width: 16.6666%; ">--</div>
          <div style="width: 16.6666%; text-align: right;">${data.barging_fee}</div>
        </div>
        `;
      }
    }
  })

  data.bunker_barges!.map((item, index) => {
    bunkersList = index == 0 ? `${item.name}` : `${item.name}, ${bunkersList}`
  });

  var htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <title>Pdf Content</title>
          <style>
            ${CSSStyles}
          </style>
      </head>
      <body>
        ${documentHeader(image)}
        <div class="main" style="line-height: 20px">
          <div>
            <div style="font-size: 22px; margin-top: 10px;">
              <b>Invoice</b>
            </div>
            <div style="border: 1px solid #000000; margin-top: 10px; margin-bottom: 10px"></div>

            <div style="display:flex; flex-direction: row; padding-top: 10px; ">

              <div style="width: 45%;">
                <div style="display: flex; flex-direction: column">
                  <div style="width: 100% ${pickBetween("font-size: 10px; line-height: 16px;", "", "")}">Billing Address</div>
                  <div style="width: 100%; ${pickBetween("font-size: 15px; line-height: 16px;", "font-size: 20px;", "font-size: 15px;")} margin-top: 2px; margin-bottom: 2px; text-transform: uppercase;"><b>${data.customer.name}</b></div>
                  <div style="width: 100%; ${pickBetween("font-size: 15px; line-height: 15px;", "", "")}">${data.customer.address}</div>
                </div>

                <div style="display: flex; flex-direction: column; margin-top: 18px;">
                  <div style="display: flex; flex-direction: row">
                    <div style="width: 20%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Attn</div>
                    <div style="width: 80%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">${data.customer.contact_persons[0].name}</div>
                  </div>
                  <div style="display: flex; flex-direction: row">
                    <div style="width: 20%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Tel</div>
                    <div style="width: 80%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">${data.customer.telephone}</div>
                  </div>
                  <div style="display: flex; flex-direction: row">
                    <div style="width: 20%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Fax</div>
                    <div style="width: 80%; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">${data.customer.fax}</div>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; margin-top: 5px;">
                  <div style="width: 100%; font-size: 12px; ${pickBetween("line-height: 13px;", "", "")}"><b>MASTER and/or OWNERS and/or CHARTERERS and/or OPERATORS and/or BUYER of NUR CEKAL and/or</b></div>
                </div>
                
                <div style="display: flex; flex-direction: column; margin-top: 10px; text-transform: uppercase;">
                  <div style="width: 100%; font-size: 12px; ${pickBetween("line-height: 16px;", "", "")}"><b>${data.customer.name}</b></div>
                  <div style="width: 100%; font-size: 12px; ${pickBetween("line-height: 16px;", "", "")}"><b>${data.customer.address}</b></div>
                </div>

              </div>

              <div style="width: 50%; margin-left: 5%; ">
                <div style="display: flex; flex-direction: row; ">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Invoice No. :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${data.display_id}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Date. :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${data.invoice_date}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">D/O No. :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${data.do_no}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">P/O No. :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${data.purchase_order_no}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Payment Terms :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${data.payment_term}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Supply Barge :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>${bunkersList}</b></div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style="width: 40%; text-align: right; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}">Page :</div>
                  <div style="width: 60%; margin-left: 10px; ${pickBetween("font-size: 12px; line-height: 16px;", "", "")}"><b>1 of 1</b></div>
                </div>
              </div>
          </div>

          <div style="border: 1px solid #000000; margin-top: 20px; margin-bottom: 5px"></div>

          <div style="display: flex; flex-direction: row">
            <div style="display: flex; flex-direction: column; width: 30%;">
             <div style="width: 100%; padding-left: 2px; font-size: 10px;">Customer Account</div>
             <div style="width: 100%; padding-left: 2px; font-size: 14px; font-weight: bold;">${data.customer.account_no}</div>
            </div>
            <div style="display: flex; flex-direction: column; margin-left: 55%; width: 15%;">
             <div style="width: 100%; font-size: 10px;">Currency Rate</div>
             <div style="width: 100%; font-size: 14px; font-weight: bold;">${data.currency_rate}</div>
            </div>
          </div>

          <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 10px"></div>
            
          <div style="display: flex; flex-direction: row; font-size: 10px; line-height: 11px;">
            <div style="width: 10%; ">No</div>
            <div style="width: 40%; ">Description</div>
            <div style="width: 16.6666%; ">Qty</div>
            <div style="width: 16.6666%; ;">Price/Unit</div>
            <div style="width: 16.6666%; display: flex; flex-direction: column; text-align: right;">
              <div style="width: 100%;">Sub Total</div>
              <div style="width: 100%;">(${convertCurrency(data.currency_rate!)})</div>
            </div>
          </div>
          
          <div style="height: 120px;">
            ${productsList}
          </div>

          <div style="display: flex; flex-direction: row">
             <div style="display: flex; flex-direction: column; margin-left: 5px; width: 30%; ">
                <div>${data.receiving_vessel_name || "-"}</div>
                <div>${data.sales_confirmation_secondary_id || "-"}</div>
              </div>
              <div style="width: 30%; margin-left: 15px;">
                <div>DELIVERED AT</div>
                <div>${data.delivery_location}</div>
              </div>
          </div>
          <div style="border: 1px solid #000000; margin-top: 10px; margin-bottom: 10px"></div>
          <div style="display: flex; flex-direction: row">
              <div style="width: 75%; padding-left: 5px;">${convertCurrencyText(data.currency_rate!)}: ${converter.toWords(totalPrice).toUpperCase()} ONLY</div>
              <div style="width: 25%; display: flex ; flex-direction: column; align-items: flex-end;">
                <div>${convertCurrency(data.currency_rate!)} ${addCommaNumber(`${totalPrice}`, "0")}</div>
              </div>
          </div>
          <div style="display: flex; flex-direction: row; align-items: flex-end; margin-left: 75%">
              <div style="width: 50%;">Discount</div>
              <div style="display: flex ;flex-direction: column; align-items: flex-end; width: 50%;">
                <div>${convertCurrency(data.currency_rate!)} ${addCommaNumber(data.discount, "0.00")}</div>
              </div>
          </div>
          <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px; width: 70px; margin-left: 90%"></div>
          <div style="display: flex; flex-direction: row; align-items: flex-end; margin-left: 60%; ">
            <div style="width: 55%; border: 1px solid #000000; text-align: right; padding-right: 20px">Total Payable</div>
            <div style="width: 45%; border: 1px solid #000000; display: flex;flex-direction: column; align-items: flex-end; padding-right: 2px;">
              <div><b>${convertCurrency(data.currency_rate!)} ${addCommaNumber(`${data.total_payable}`, "0")}</b></div>
            </div>
          </div>

          <div style="border: 1px solid #000000; margin-top: 20px; margin-bottom: 5px"></div>
          <div style="display: flex; flex-direction: column; line-height: 16px;">
            <div style="width: 50% ; font-size: 12px">Please transfer all payment to: </div>
            <div style="width: 50%; font-size: 12px">${data.bank_details?.name}</div>
            <div style="width: 50%; font-size: 12px">${data.bank_details?.address}</div>
            <div style="width: 50%; font-size: 12px">Account No.: ${data.bank_details?.account_no}</div>
            <div style="width: 50%; font-size: 12px">Swift Code: ${data.bank_details?.swift_code}</div>
          </div>
          <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px"></div>

          <div style="display: flex; flex-direction: row;">
            <div style="display: flex; flex-direction: column; line-height: 16px; width: 50%;">
              <div style="font-size: 12px">Notes:</div>
              <div style="font-size: 12px; width: 100%;">${data.notes || "-"}</div>
            </div>

            <div style="display: flex; flex-direction: column; line-height: 16px; width: 40%; margin-left:10%;">
              <div style="font-size: 12px">This is computer generated, no signature required.</div>
              <div style="font-size: 12px">TUMPUAN MEGAH DEVELOPMENT SDN BHD (200701040866 (798898-A))</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; line-height: 16px; margin-left: 80%; width: 20%; text-align: right;">
            <div style="font-size: 12px">TMD-F-OPS-002</div>
            <div style="font-size: 12px">Rev: 0</div>
          </div>

        </div>
      </body>
    </html>
  `

  return htmlContent;
}