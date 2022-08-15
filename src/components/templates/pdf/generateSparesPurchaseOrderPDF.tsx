import { convertCurrency } from "../../../constants/Currency";
import { pickBetween } from "../../../helpers/GenericHelper";
import { addCommaNumber } from "../../../helpers/NumericHelper";
import { SparesPurchaseOrder } from "../../../types/SparesPurchaseOrder";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";
var converter = require('number-to-words');

export const generateSparesPurchaseOrderPDF = (data: SparesPurchaseOrder, image) => {
  var htmlContent: string = '';

  // Pull data here 

  htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <title>Pdf Content</title>
        <link href='https://fonts.googleapis.com/css?family=Poppins' rel='stylesheet'>
        <style>
          ${CSSStyles}
          @page 
          {
          size:  auto;   /* auto is the initial value /
          margin: 25mm 25mm 25mm 25mm;  / this affects the margin in the printer settings /
          }

          html
          {
              background-color: #FFFFFF; 
              margin: 0px;  / this affects the margin on the html before sending to printer /
          }
        </style>
    </head>
    <body>  
      ${documentHeader(image)}
      
      <div class="main" style="line-height: 20px">

        <div>
          <div style="text-align: right; font-size: 30px">
            <b>Purchase Order</b>
          </div>

          <div style="display:flex; flex-direction: row; padding-top: 10px;">
            <div style="width: 50%;">
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%; "><b>Vendor</b> </div>
                <div style=" width: 3%; ">:</div>
                <div style="width: 57%;">${data.supplier.name}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%;"><b>Address</b> </div>
                <div style=" width: 3%; ">:</div>
                <div style="width: 57%;"> ${data.supplier.address}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%"><b>Tel no.</b> </div>
                <div style=" width: 3%; ">:</div>
                <div style="width: 57%;"> ${data.supplier.contact_persons[0].phone_number}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%"><b>Attention</b> </div>
                <div style=" width: 3%; ">:</div>
                <div style="width: 57%;"> ${data.supplier.contact_persons[0].name}</div>
              </div>
            </div>

            <div style="width: 50%;">
              <div style="padding-left: 20%; width: 80%;">
                <div style="display: flex; flex-direction: row;">
                  <div style=" width: 40%"><b>PO No.</b> </div>
                  <div style=" width: 3%; ">:</div>
                  <div style="width: 57%"> ${data.display_id}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 40%"><b>Date</b> </div>
                  <div style=" width: 3%; ">:</div>
                  <div style="width: 57%"> ${data.purchase_order_date}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 40%"><b>Payment Terms</b> </div>
                  <div style=" width: 3%; ">:</div>
                  <div style="width: 57%;"> ${data.payment_term}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 40%"><b>Remarks</b> </div>
                  <div style=" width: 3%; ">:</div>
                  <div style="width: 57%;"> ${data.remarks}</div>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 5px;">
            <div>We are pleased to confirm the following orders: </div>
          </div>

          <div style="margin-top: 15px;">
            <div style="display: flex; flex-direction: row">
              <div style=" width: 20%;"><b>Vessel Name</b> </div>
              <div>: ${data.vessel_name.name}</div>
            </div>  
            <div style="display: flex; flex-direction: row">
              <div style=" width: 20%;"><b>ETA/Delivery date</b> </div>
              <div>: ${data.ETA_delivery_date}</div>
            </div>
            <div style="display: flex; flex-direction: row">
              <div style=" width: 20%;"><b>Type of Supply</b> </div>
              <div>: ${data.type_of_supply}</div>
            </div>
          </div>

          <div style="margin-top: 20px; height: 220px;">
            
            <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
            <div style="display: flex; flex-direction: row;">
              <div style="width: 5%;"><b>No </b></div>
              <div style="width: 15%;"><b>Code</b></div>
              <div style="width: 35%;"><b>Description</b></div>
              <div style="width: 10%;"><b>UoM</b></div>
              <div style="width: 10%;"><b>Quantity</b></div>
              <div style="width: 15%;"><b>Unit Price</b></div>
              <div style="width: 10%;"><b>Amount</b></div>
            </div>
            <div style="display: flex; flex-duration: row">
              <div style="padding-left: 77%;">${data.currency_rate}</div>
              <div style="padding-left: 10%;">${data.currency_rate}</div>
            </div>
            <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
            <div style="display: flex; flex-direction: row;">

              <div style="width: 5%;"><b>1. </b></div>
              <div style="width: 15%;"><b>${data.product.product_code}</b></div>
              <div style="width: 35%;"><b>${data.product.product_description}</b></div>
              <div style="width: 10%;"><b>${data.unit_of_measurement}</b></div>
              <div style="width: 10%;">
                <div style="padding-left: 10px;"> 
                 <b>${addCommaNumber(data.quantity, "0")}</b>
                </div>
              </div>
              <div style="width: 15%;">
                <div style="padding-left: 20px;">  
                  <b>${addCommaNumber(data.unit_price, "0")}</b>
                </div>
              </div>
              <div style="width: 10%;"><b>${addCommaNumber(`${Number(data.quantity) * Number(data.unit_price)}`, "0")}</b></div>

            </div>
          </div>

          <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
          <div style="width: 100%; display: flex; flex-direction: row;">
            <div style="width: 80%; font-size: 12px;"><b>${converter.toWords(Number(data.total_amount)).toUpperCase()} ONLY</b></div>

            <div style="width: 20%;">
              <div style="text-align: right; padding-left: 20%; font-size: 13px;">
                Discount: <b>${addCommaNumber(data.discount, "0")}</b>
              </div>
              <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
              <div style="text-align: right; padding-left: 20%; font-size: 13px;">
                <b>${addCommaNumber(data.total_amount, "0")}</b>
              </div>
            </div>
          </div>

          <div style="width: 100%; font-size: 11px; margin-top: 100px;"><b>THIS IS COMPUTER GENERATED, NO SIGNATURE REQUIRED</b></div>
        </div>        

      </div>
      
    </body>
    </html>
  `

  return htmlContent;
}