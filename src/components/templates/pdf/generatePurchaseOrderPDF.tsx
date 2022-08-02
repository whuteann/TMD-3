import { convertCurrency } from "../../../constants/Currency";
import { addCommaNumber } from "../../../helpers/NumericHelper";
import { PurchaseOrder } from "../../../types/PurchaseOrder";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";
var converter = require('number-to-words');

export const generatePurchaseOrderPDF = (data: PurchaseOrder, image) => {
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
          <div style="text-align: right; font-size: 22px; ">
            <b>PURCHASE ORDER</b>
          </div>

          <div style="display:flex; flex-direction: row; padding-top: 10px;">
            <div style="width: 50%;">
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%; "><b>Vendor</b> </div>
                <div style=" width: 3%; ">:</div>
                <div style="width: 57%;"> ${data.supplier.name}</div>
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
                  <div style=" width: 40%"><b>Purchase Order No.</b> </div>
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
              </div>
            </div>
          </div>

          <div style="margin-top: 15px;">
          <div>We are pleased to CONFIRM orders under our terms and condition as follows</div>
          <div>(a copy of which is available upon request):</div>
          <div style="margin-left: 20%; margin-top: 10px;">OWNERS and/or CHARTERERS and/or OPERATORS and/or BUYER of :</div>
          </div>

          <div style="margin-top: 15px;">
            <div style="display: flex; flex-direction: row">
              <div style="width: 25%;"><b>Vessel Name</b> </div>
              <div style=" width: 3%; ">:</div>
              <div style="width: 37%;"> ${data.vessel_name.name}</div>
            </div>  
            <div style="display: flex; flex-direction: row">
              <div style="width: 25%;"><b>ETA/Delivery date</b> </div>
              <div style=" width: 3%; ">:</div>
              <div style="width: 37%;"> ${data.ETA_delivery_date.startDate} to ${data.ETA_delivery_date.endDate}</div>
            </div>
            <div style="display: flex; flex-direction: row">
              <div style="width: 25%;"><b>Place of Supply</b> </div>
              <div style=" width: 3%; ">:</div>
              <div style="width: 37%;"> ${data.port}, ${data.delivery_location}</div>
            </div>
          </div>

          <div style="margin-top: 20px; height: 220px;">
            <div style="display: flex; flex-direction: row;">
              <div style="width: 80%;"><b>Agent: ----</b></div>
              <div><b>Agent PIC:</b></div>
            </div>
            <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
            <div style="display: flex; flex-direction: row;">
              <div style="width: 5%"><b>No </b></div>
              <div style="width: 15%"><b>Part Code</b></div>
              <div style="width: 35%"><b>Description</b></div>
              <div style="width: 10%"><b>UoM</b></div>
              <div style="width: 10%"><b>Quantity</b></div>
              <div style="width: 15%"><b>Unit Price</b></div>
              <div style="width: 10%"><b>Amount</b></div>
            </div>
            <div style="display: flex; flex-duration: row">
              <div style="margin-left: 75%">${data.currency_rate}</div>
            </div>
            <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
            <div style="display: flex; flex-direction: row;">

              <div style="width: 5%"><b>1. </b></div>
              <div style="width: 15%"><b>${data.product.sku}</b></div>
              <div style="width: 35%"><b>${data.product.description}</b></div>
              <div style="width: 10%"><b>${data.unit_of_measurement}</b></div>
              <div style="width: 10%;"><b>${addCommaNumber(data.quantity, "0")}</b></div>
              <div style="width: 13%"><b>${addCommaNumber(data.unit_price, "0")}</b></div>
              <div style="width: 12%"><b>${addCommaNumber(data.total_amount, "0")}</b></div>

            </div>
            
            <div style="width: 100%; padding-left: 20%;">${data.delivery_mode_details}</div>
          </div>

          <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
          <div style="display: flex; flex-direction: row;">
            <div style="width: 80%; font-size: 13px;"><b>${converter.toWords(Number(data.total_amount)).toUpperCase()} ONLY</b></div>
            <div style="width: 20%; font-size: 13px; text-align:right;  "><b>${convertCurrency(data.currency_rate)} ${addCommaNumber(data.total_amount, "0")}</b></div>
          </div>

          <div style="width: 100%; font-size: 13px; margin-top: 30px">
            <div>Remarks:-</div>
            <div style="margin-bottom: 5px;">${data.remarks || "-"}</div>
            <div>Note:-</div>
            <div>1. The product supplied must confirm to lSO 8217:2010 Fuel Standard or Low Sulphur Marine Gas Oil 500ppm and very low 
            Sulphur Fuel Oil 0.5%</div>
            <div>2. Loading is subject to lab test:Sulfur content <0.05% ,Flashpoint>60 for Low Sulphur Marine Gas Oil.</div>
            <div>3. Loading is subject to lab test:Sulfur content <0.5% for very Low Sulphur Fuel Oil 0.5%</div>
            <div>4. The final quantity supplied shall be based on Gross Standard Volume (at 15degC)</div>
            <div>5. To retain & seal both product sample</div>
            <div>6. Supplier must present Certificate of Quality prior to loading.</div>
          </div>
        </div>

        <div style="font-size: 15px; width: 100%; margin-top: 10px; display: flex; flex-direction: row;">
          <div style="width: 40%">THIS IS COMPUTER GENERATED, NO SIGNATURE REQUIRED</div>
          <div style="width: 35%"></div>
          <div style="width: 25%">TMD-F-OPS-004 REV.0</div>
        </div>

      </div>
      
    </body>
    </html>
  `

  return htmlContent;
}