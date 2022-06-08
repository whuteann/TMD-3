import { convertCurrency } from '../../../constants/Currency';
import { pickBetween } from '../../../helpers/GenericHelper';
import { Quotation } from '../../../types/Quotation';
import { CSSStyles } from './CSS';
import { documentHeader } from './DocumentHeader';

export function generatePDFQuotation(data: Quotation, image) {
  var htmlContent: string = "";
  var productsList: string = "";
  var portsList: string = "";
  var bunkersList = "";
  var deliveryModeList = "";

  data.bunker_barges!.map((item, index) => {
    bunkersList = index == 0 ? `${item.name}` : `${item.name}, ${bunkersList}`
  });

  data.delivery_modes!.map((item, index) => {
    deliveryModeList = index == 0 ? `${item}` : `${item}, ${deliveryModeList}`
  });

  data.products.map((item, index) => {
    var prices: string = "";

    item.prices.map((item, index) => {
      prices = `
        ${prices}
        <div style="display: flex; flex-direction: row; margin-top: 7px;">
          <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Price ${index + 1}</div>
          <div style="width: 10px;">:</div>
          <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
            ${convertCurrency(data.currency_rate)} ${item.value} per ${item.unit}
          </div>
        </div>
      `
    })

    productsList = `
      ${(index == 0) ? `<div style="margin-top: 20px;"></div>` : ""}
      ${productsList}
      <div style="display: flex; flex-direction: row; margin-top: 7px;">
          <div><b>Product </b></div>
          <div>: </div>
          <div>
            ${item.product.name}
          </div>
      </div>

      <div style="display: flex; flex-direction: row; margin-top: 7px;">
        <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Quantity</div>
        <div style="width: 10px;">:</div>
        <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
          ${item.quantity} ${item.unit}
        </div>
      </div>

      ${prices}
      ${(index + 1 == data.products.length) ? `<div style="margin-top: 20px;"></div>` : ""}
    `
  })

  data.ports.map((item, index) => {
    portsList = `
    ${portsList}
    <div style="display: flex; flex-direction: row; margin-top: 7px;">
        <div><b>Port ${index + 1}</b></div>
        <div>:</div>
        <div>
          ${item.port}
        </div>
    </div>
    <div style="display: flex; flex-direction: row; margin-top: 7px;">
      <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Delivery Location</div>
      <div style="width: 10px;">:</div>
      <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
        ${item.delivery_location}
      </div>
    </div>
    ${(index + 1 == data.ports.length) ? `<div style="margin-top: 20px;"></div>` : ""}
    `
  })


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
        </style>
    </head>
    <body>
      ${documentHeader(image)}
      <div class="main" style="line-height: 20px">

      <div style="${pickBetween("line-height: 14px", "line-height: 17px", "line-height: 17px")}">
        <div style="${pickBetween("font-size: 12px; line-height: 10px;", "", "")}">Ref: ${data?.display_id}</div>
        <div style="${pickBetween("font-size: 12px", "", "")}">Date: ${data?.quotation_date}</div>
        <div style="${pickBetween("margin-top: 8px; font-size: 13px;", "margin-top: 15px;", "margin-top: 15px;")}">${data?.customer?.name},</div>
        <div style="width: 35%; ${pickBetween("font-size: 13px", "", "")}">${data?.customer?.address}</div>
      </div>

      <div>
        <div style="line-height: 20px;">
          <div style="margin-top: 10px; font-weight: bold; ${pickBetween("width: 100%; font-size: 8px; line-height: 12px;", "", "")}">QUOTATION</div>
          <div style="margin-top: 7px; ${pickBetween("width: 100%; font-size: 8px; line-height: 12px;", "", "")}">Dear Sir/Madam,</div>
          <div style="${pickBetween("width: 100%; font-size: 8px; line-height: 12px;", "", "")}">We are pleased to submit our offer as follows for your acceptance:</div>
        </div>
        <div style="line-height: 10px;">
          
        <div style="display: flex; flex-direction: row; margin-top: 10px;">
            <div style="${pickBetween("width: 38%;", "width:38%;", "width:38%;")} ${pickBetween("font-size: 13px", "", "")}">- Delivery Date/Time</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px", "", "")}">
              ${data.delivery_date?.startDate} to  ${data.delivery_date?.endDate}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Receiving Vessel's Name</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.receiving_vessel_name}
            </div>
          </div>

          
          ${productsList}
          ${portsList}
          
          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Bunker Barge(s)</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${bunkersList}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Barging Fee</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.barging_fee
      ?
      `${convertCurrency(data.currency_rate)} ${data.barging_fee}${data.barging_remark ? `/${data.barging_remark}` : ""}`
      :
      "N/A"
    }
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Payment Term</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.payment_term}
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Currency Rate</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.currency_rate}
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Conversion Factor</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.conversion_factor ? data.conversion_factor : "N/A"}
            </div>
          </div>

          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Validity</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.validity_date} AT ${data.validity_time}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Mode of Delivery</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${deliveryModeList}
            </div>
          </div>
          
          <div style="display: flex; flex-direction: row; margin-top: 7px;">
            <div style="${pickBetween("width: 38%; font-size: 13px; line-height: 5px;", "width: 38%;", "width: 38%;")} ">- Remarks</div>
            <div style="width: 10px;">:</div>
            <div style="width: 62%; ${pickBetween("font-size: 13px;", "", "")}">
              ${data.remarks ? data.remarks : ""}
            </div>
          </div>

        </div>
      </div>
      
      <div style="line-height: 20px;">
        <div style="display: flex; flex-direction: row; margin-top: 5px; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">Price quoted is inclusive Sales & Services Tax</div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px; margin-top: 15px;", "margin-top: 20px;", "margin-top: 20px;")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">Spacer barge, mooring boat, tug boat, pilotage and fender (if any) to be for buyer arrangement and cost. </div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">In order us able to supply smoothly without any delay according to your schedule given, we need your confirmation 2-3 working days in advance for prior bunker arrangement.  </div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">The bunker job will not commence until the PURCHASE ORDER is received by the supplier.</div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">Loading is subject to receiving vessel freeboard height, equipment(s) and weather conditions.</div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">Regardless of any ETA advice, vessels arriving outside of the agreed supply/delivery/ stemmed dates will be  supplied on a when available basis (commercial best endeavour). Even if vessel arrives within the stemmed dates, any changes to the arrival ETA provided by vessel's owners/charterers/agents/contractors/representatives within 24 hours of vessel's expected arrival may not be acceded to. and may be supplied on a when available basis (commercial best endeavour) without liability or penalty against seller.</div>
        </div>
        <div style="display: flex; flex-direction: row; ${pickBetween("line-height: 10px;", "", "")}">
          <div style="width: 9px;">-</div>
          <div style="width: 100%; ${pickBetween("font-size: 8px;", "", "")}">TMD terms and conditions shall apply for this delivery.     </div>
        </div>
      </div>

      <div style="margin-top: 35px;">
        <div ${pickBetween('style=" width: 100%; font-size: 13px"', "", "")}>Thank you.</div>
        <div style="${pickBetween("width: 62%; margin-top: 10px; font-size: 15px;", "margin-top: 20px;", "margin-top: 20px;")} ">Yours faithfully,</div>
        <div style="${pickBetween("font-size: 8px", "", "")}">for<b> TUMPUAN MEGAH DEVELOPMENT SDN BHD </b></div>
        <div style="${pickBetween("width: 62%; font-size: 10px; margin-top: 10px", "margin-top: 20px;", "margin-top: 20px;")} ">This is computer generated. NO SIGNATURE REQUIRED.</div>
      </div>
      </div>
    </body>
  </html>
`;
  return htmlContent;
}