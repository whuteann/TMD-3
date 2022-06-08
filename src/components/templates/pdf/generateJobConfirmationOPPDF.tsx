import { pickBetween } from "../../../helpers/GenericHelper";
import { JobConfirmation } from "../../../types/JobConfirmation";
import { CSSStyles } from "./CSS"


export const generateJobConfirmationOPPDF = (data: JobConfirmation) => {
  var htmlContent: string = "";
  var bunkersList = "";
  var productList = "";
  var receivingVesselContactPersonList = "";

  var code_arr: Array<string> = data.secondary_id.split(" / ");
  code_arr.splice(3, 0, "OPS");
  var docID: string = code_arr.join(" / ");

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
    `;
  })

  data.bunker_barges.map((item, index) => {
    bunkersList = index == 0 ? `${item.name}` : `${item.name}, ${bunkersList}`
  });

  data?.receiving_vessel_contact_person!.map((contact_person, index) => {
    if (index == 0) {
      receivingVesselContactPersonList = receivingVesselContactPersonList +
        `
          <div style="display: flex; flex-direction: row; margin-top: 10px;">
            <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">RECEIVING VESSEL CONTACT PERSON</div>
            <div style="width: 10px; font-size: 18px;">:</div>
            <div style="width: 400px; font-size: 18px; line-height: 25px;">${index + 1}) ${contact_person}</div>
           </div>
        `
    } else {
      receivingVesselContactPersonList = receivingVesselContactPersonList +
        `
          <div style="display: flex; flex-direction: row; margin-top: 10px;">
            <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;"></div>
            <div style="width: 10px; font-size: 18px;">:</div>
            <div style="width: 400px; font-size: 18px; line-height: 25px;">${index + 1}) ${contact_person}</div>
           </div>
        `
    }

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

          #refTable {
            td {
              margin-top: 1em;
              margin-bottom: 1em;
            }
          }
        </style>
    </head>
    <body>

      <div style="width: 100%;">
        <h1 style="text-align: center">TUMPUAN MEGAH DEVELOPMENT SDN BHD</h1>
        <h1 style="text-align: center">JOB CONFIRMATION</h1>
        <h1 style="text-align: right; font-size: 20px">RFQ : ${data?.quotation_secondary_id}</h1>
        
        <table id="refTable" style="font-weight: bold; font-size: 1.17em;">
          <tr>
            <td>REF</td>
            <td>:</td>
            <td>${docID}</td>
          </tr>

          <tr>
            <td>TO</td>
            <td>:</td>
            <td>OPERATION TEAM</td>
          </tr>

          <tr>
            <td>DATE</td>
            <td>:</td>
            <td>${data?.confirmed_date}</td>
          </tr>
        </table>
      </div>

      <div style="line-height: 0px; line-height: 25px;">
        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">CUSTOMER</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px;">${data?.customer?.name}</div>
        </div>
        
        ${productList}

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


          ${data?.receiving_vessel_contact_person!.length > 0
              ?
              receivingVesselContactPersonList
              :
              `
                      <div style="display: flex; flex-direction: row; margin-top: 10px;">
                        <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">RECEIVING VESSEL CONTACT PERSON</div>
                        <div style="width: 10px; font-size: 18px;">:</div>
                        <div style="width: 400px; font-size: 18px; line-height: 25px;">N/A</div>
                      </div>
                      `
            }



        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">SURVEYOR CONTACT PERSON</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.surveyor_contact_person || "N/A"}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">CONDITIONS</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.conditions || "N/A"}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
          <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">PAYMENT TERM</div>
          <div style="width: 10px; font-size: 18px;">:</div>
          <div style="width: 400px; font-size: 18px; line-height: 25px;">${data?.payment_term}</div>
        </div>

        <div style="display: flex; flex-direction: row; margin-top: 10px;">
        <div style="${pickBetween("", "width: 320px;", "width: 380px;")} font-size: 18px;">REMARKS</div>
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