import { convertCurrency } from "../../../constants/Currency";
import { pickBetween } from "../../../helpers/GenericHelper";
import { JobConfirmation } from "../../../types/JobConfirmation";
import { CSSStyles } from "./CSS"


export const generateJobConfirmationAAPDF = (data: JobConfirmation) => {
  var htmlContent: string = "";

  var code_arr: Array<string> = data.secondary_id.split(" / ");
  code_arr.splice(3, 0, "ACCT");
  var docID: string = code_arr.join(" / ");


  var productList = "";
  var bunkersList = "";

  data.products.map((product) => {
    productList = productList +
      `
              <div style="display: flex; flex-direction: row; margin-top: 10px;">
                <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">PRODUCT</div>
                <div style="width: 10px; font-size: 18px;">:</div>
                <div style="width: 400px; font-size: 18px; line-height: 25px;">${product.product.name}</div>
              </div>
              
              <div style="display: flex; flex-direction: row; margin-top: 10px;">
                <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">QTY</div>
                <div style="width: 10px; font-size: 18px;">:</div>
                <div style="width: 400px; font-size: 18px; line-height: 25px;">${product.quantity} ${product.unit}</div>
              </div>

              <div style="display: flex; flex-direction: row; margin-top: 10px;">
                <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">PRICE</div>
                <div style="width: 10px; font-size: 18px;">:</div>
                <div style="width: 400px; font-size: 18px; line-height: 25px;">${convertCurrency(data.currency_rate)} ${product.price.value} / ${product.price.unit}</div>
              </div>
              `;
  })

  data.bunker_barges.map((item, index) => {
    bunkersList = index == 0 ? `${item.name}` : `${item.name}, ${bunkersList}`
  });

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

      <div style="width: 800px;">
        <h1 style="text-align: center">TUMPUAN MEGAH DEVELOPMENT SDN BHD</h1>
        <h1 style="text-align: center">JOB CONFIRMATION</h1>
        <h1 style="text-align: right; font-size: 20px">RFQ : ${data?.quotation_secondary_id}</h1>

        <div style="line-height: 9px;">
          <h3>REF: ${docID}</h1>
          <h3>TO: ACCOUNT DEPARTMENT</h1>
          <h3>DATE: ${data?.confirmed_date}</h1>
        </div>
      </div>

      <div style="line-height: 0px; line-height: 25px;">
        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">CUSTOMER</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px;">${data?.customer?.name}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">ADDRESS</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.customer?.address}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">TEL/ FAX.</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.customer?.telephone} / ${data?.customer?.fax}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">PURCHASE ORDER / SALES CONFIRM</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.purchase_order_no || "N/A"}</div>
        </div>

        ${productList}

        ${data.barging_fee
      ?
      `
            <div style="display: flex; flex-direction: row; margin-top: 10px;">
              <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">BARGING FEE</div>
              <div style="width: 10px; font-size: 18px;">:</div>
              <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.barging_fee}/${data.barging_remark}</div>
            </div>
            `
      :
      `
            <div style="display: flex; flex-direction: row; margin-top: 10px;">
              <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">BARGING FEE</div>
              <div style="width: 10px; font-size: 18px;">:</div>
              <div style="width: 400px; font-size: 18px; line-height: 25px;">N/A</div>
            </div>
            `
    }

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">TERMS</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.payment_term}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">DELIVERY VESSEL</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${bunkersList}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">PORT</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.port}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">DELIVERY LOCATION</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.delivery_location}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">DELIVERY DATE & TIME</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.delivery_date?.startDate} to ${data?.delivery_date?.endDate}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">RECEIVING VESSEL NAME</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data.receiving_vessel_name || "N/A"}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">REMARKS</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.remarks || "N/A"}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">REMARKS FOR OPERATION TEAM</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.remarks_OT || "N/A"}</div>
        </div>

      </div>
      
      <div>
          <p style="text-align: right; font-size: 10px;">TMD-1-OPS-017</p>
          <p style="text-align: right; font-size: 10px;">Rev:1</p>
      </div>
    
      </body>
    </html>
  `

  return htmlContent;
}