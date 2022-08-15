import { convertCurrency } from "../../../constants/Currency";
import { convertUnitShortHand } from "../../../constants/Units";
import { pickBetween } from "../../../helpers/GenericHelper";
import { SalesConfirmation } from "../../../types/SalesConfirmation";
import { CSSStyles } from "./CSS"
import { documentHeader } from "./DocumentHeader";

export const generateSalesConfirmationPDF = (data: SalesConfirmation, image) => {
  var htmlContent: string = '';

  // Pull data here
  var productsList = "";
  var bunkersList = "";
  var unit = "";
  var unitList: Array<string> = [];

  data.bunker_barges.map((item, index) => {
    bunkersList = index == 0 ? `${item.name}` : `${item.name}, ${bunkersList}`
  });

  data.products.map((product, index) => {
    unitList.push(product.price.unit);

    productsList = `
      ${productsList}
      <div style="display: flex; flex-direction: row;">
        <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${product.product.name}</div>
        <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${product.quantity}</div>
        <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${product.price.unit}</div>
        <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${product.price.value}</div>
      </div>
      ${product.price.remarks
        ?
        `
        <div style="display: flex; flex-direction: row;">
          <div style="width: 25%; font-weight: bold; ${pickBetween("font-size: 12px", "", "")}">${product.price.remarks}</div>
        </div>
        `
        :
        ""
      }
    `
    if (index == (data.products.length - 1)) {
      if (data.barging_fee) {
        productsList = `
        ${productsList}
        <div style="display: flex; flex-direction: row;">
          <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">Barging Fee</div>
          <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">--</div>
          <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${data.barging_unit}</div>
          <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}">${data.barging_fee}</div>
        </div>
        ${data.barging_remark
          ?
          `
          <div style="display: flex; flex-direction: row;">
            <div style="width: 25%; font-weight: bold; ${pickBetween("font-size: 12px", "", "")}">${data.barging_remark}</div>
          </div>
          `
          :
          ""
        }
      `
      }
    }
  })

  let check_same: Boolean = true;

  unitList.map((item, index) => {
    if(item != unitList[0]){
      check_same = false;
    }
  })

  if (check_same) {
    unit = `${convertUnitShortHand(unitList[0])}`
  } else {
    unit = "UNIT";
  }

  htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <title>Pdf Content</title>
          <link href='https://fonts.googleapis.com/cssfamily=Poppins' rel='stylesheet'>
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
            <div style="text-align: right; width: 100%; ${pickBetween("font-size: 20px", "font-size: 30px", "font-size: 22px")}">
              <b>SALES CONFIRMATION</b>
            </div>

            <div style="display:flex; flex-direction: row; padding-top: 10px; width: 100%;">
              <div style="width:60%;  ${pickBetween("width: 60%;", "", "")}">
                <div style="display: flex; flex-direction: row ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                  <div style=" width: 20%; "><b>Customer</b> </div>
                  <div style="width: 9px;" >:</div>
                  <div style=" ${pickBetween("width: 55%;", "width: 50%;", "width: 50%;")}">${data.customer.name}</div>
                </div>
                <div style="display: flex; flex-direction: row  ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                  <div style=" width: 20%;"><b>Address</b> </div>
                  <div style="width: 9px;">:</div>
                  <div style="${pickBetween("width: 55%;", "width: 50%;", "width: 50%;")}">${data.customer.address}</div>
                </div>
                <div style="display: flex; flex-direction: row; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                  <div style=" width: 20%;"><b>Attention</b> </div>
                  <div style="width: 9px;">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 50%;", "width: 50%;")}">${data.customer.contact_persons[0].name}</div>
                </div>
                <div style="display: flex; flex-direction: row; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                  <div style=" width: 20%;"><b>Fax</b> </div>
                  <div style="width: 9px;">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 50%;", "width: 50%;")}">${data.customer.fax}</div>
                </div>
                <div style="display: flex; flex-direction: row; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                  <div style=" width: 20%; "><b>Phone</b> </div>
                  <div style="width: 9px;">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 50%;", "width: 50%;")}">${data.customer.telephone}</div>
                </div>
              </div>

              <div style=" ${pickBetween("width: 40%;", "width: 40%;", "width: 40%;")}  align-items: flex-end; flex-direction: column">
                <div style="display: flex; flex-direction: row">
                  <div style="width: 30%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")} "><b>Sales Ref</b> </div>
                  <div style="width: 9px; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 70%;", "width: 70%;")}">${data.secondary_id}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 30%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}"><b>Quote Ref</b> </div>
                  <div style="width: 9px; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 70%;", "width: 70%;")}">${data.quotation_secondary_id}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 30%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}"><b>Date</b> </div>
                  <div style="width: 9px; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">:</div>
                  <div style=" ${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 70%;", "width: 70%;")}">${data.confirmed_date}</div>
                </div>
                <div style="display: flex; flex-direction: row">
                  <div style=" width: 30%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}"><b>Payment Term</b> </div>
                  <div style="width: 9px; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">:</div>
                  <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 70%;", "width: 70%;")}">${data.payment_term}</div>
                </div>
              </div>

            </div>

            <div style="margin-top: 15px;">
              <div style="width: 100%; margin-top: 8px; ${pickBetween("font-size: 7px; line-height: 8px;", "", "")}">We are pleased to CONFIRM bunker nomination under our terms and condition as follows</div>
              <div style="width: 100%; margin-top: 8px; ${pickBetween("font-size: 7px; line-height: 8px;", "", "")}">(a copy of which is available upon request):</div>
              <div style="margin-left: 20%; width: 80%; margin-top: 8px; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">OWNERS and/or CHARTERERS and/or OPERATORS and/or BUYER of :</div>
            </div>

            <div style="margin-top: 15px;">
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%; ${pickBetween("font-size: 12px", "", "")}"><b>ETA/Delivery date</b> </div>
                <div style="width: 9px; ${pickBetween("font-size: 12px", "", "")}">:</div>
                <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 60%;", "width: 60%;")}">${data.delivery_date?.startDate} ${data.delivery_date?.endDate ? `to ${data.delivery_date?.endDate}` : ""}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%; ${pickBetween("font-size: 12px", "", "")}><b>Vessel Name</b> </div>
                <div style=" width: 30%; ${pickBetween("font-size: 12px", "", "")}><b>Vessel Name</b> </div>
                <div style="width: 9px; ${pickBetween("font-size: 12px", "", "")}">:</div>
                <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 60%;", "width: 60%;")}">${data.receiving_vessel_name}</div>
              </div>
              <div style="display: flex; flex-direction: row">
                <div style=" width: 30%; ${pickBetween("font-size: 12px", "", "")}"><b>Place of Supply</b> </div>
                <div style="width: 9px; ${pickBetween("font-size: 12px", "", "")}">:</div>
                <div style="${pickBetween("font-size: 12px; width: 55%; line-height: 13px;", "width: 60%;", "width: 60%;")}">${data.port}, ${data.delivery_location}</div>
              </div>
            </div>

            <div style="margin-top: 20px; height: 260px;">

              <div style="display: flex; flex-direction: row;">
                <div style="width: 70%; ${pickBetween("font-size: 12px", "", "")}"><b>Agent</b> : ---</div>
                <div style="${pickBetween("font-size: 12px", "", "")}"><b>Agent P-I-C</b> : </div>
              </div>
              
              <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px; width:"></div>
              <div style="display: flex; flex-direction: row;">
                <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}"><b>Description </b></div>
                <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}"><b>Quantity</b></div>
                <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}"><b>Unit</b></div>
                <div style="width: 25%; ${pickBetween("font-size: 12px", "", "")}"><b>Unit Price</b></div>
              </div>
              <div style="display: flex; flex-duration: row">
                <div style="margin-left: 75%; ${pickBetween("font-size: 12px", "", "")}">${convertCurrency(data.currency_rate)} (${data.currency_rate})/${unit}</div>
              </div>
              <div style="border: 1px solid #000000; margin-top: 5px; margin-bottom: 5px;"></div>
                ${productsList}
            </div>

            <div style="width: 100%;">
              <div style="${pickBetween("font-size: 12px; line-height: 20px;", "", "")}">Sales tax imposed by authority (if any) to be for receiving vessel's owner's account.</div>
              <div style="display: flex; flex-direction: row; margin-top: 10px; width: 100%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                <div style="width: 18%;"><b>Payment Terms</b></div>
                <div style="width: 80%;">: ${data.payment_term}  </div>
              </div>
              <div style="margin-left: 19.5%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">Our General Terms and Conditions of Sales will apply. A Copy of which is available upon request.</div>
              <div style="margin-left: 19.5%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")} width: 80%; margin-top: 10px;">Failure to request for a copy of our General Term and Conditions of Sales shall be deemed as acknowledge and confirmation by the buyer that they/he/she is/are aware of and have duly accepted he General Terms and Conditions of Sales.</div>
              <div style="margin-left: 19.5%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")} width: 80%; margin-top: 10px;">This supply will be made in accordance to the laws and/or regulations governing where nominated vessel will take bunkers from and/or in the Courts of Judiciary where the Seller deems appropriate</div>

              <div style="display: flex; flex-direction: row; margin-top: 10px; width: 100%; ${pickBetween("font-size: 12px; line-height: 13px;", "", "")}">
                <div style="width: 18%;"><b>Comment</b></div>
                <div style="width: 80%;">: Basic no DNV/Maritec Surveyors/Date&Time of bunkering subject to sufficient arrival notice and our best endeavour delivery.</div>
              </div>

            <div style="widht: 100%;">
              <div style=" margin-top:20px; width:33%; ${pickBetween("font-size: 10px; line-height: 13px; margin-left: 70%;", "font-size: 13px; margin-left: 67%;", "font-size: 13px; margin-left: 67%;")}">We hereby accept the price, terms and</div>
              <div style=" width:33%;  ${pickBetween("font-size: 10px; line-height: 13px; margin-left: 70%;", "font-size: 13px; margin-left: 67%;", "font-size: 13px; margin-left: 67%;")}">conditions of this confirmation order</div>
              <div style=" ${pickBetween("margin-left: 70%; margin-top: 30px;", "margin-left: 68%; margin-top: 50px;", "margin-left: 68%; margin-top: 50px;")} width:30%; border: 0.1px solid #000000; "></div>
              <div style=" width:30%;  ${pickBetween("font-size: 8px; line-height: 13px; margin-left: 70%;", "font-size: 13px; margin-left: 68%;", "font-size: 13px; margin-left: 68%;")}">for <b>${data.customer.name.toUpperCase()}</b></div>

              <div style="display: flex; flex-direction: row; width: 100%;">
                <div style="width: 45%; ${pickBetween("font-size: 9px;", "font-size: 11px;", "font-size: 11px;")}">for <b>TUMPUAN MEGAH DEVELOPMENT SDN BHD</b> </div>
                <div style="margin-left: 25%;  ${pickBetween("font-size: 9px; width: 30%;", "font-size: 11px; width: 30%;", "font-size: 11px; width: 30%;")}">Name,Designation,Company Stamp,Date </div>  
              </div>

              <div style="display: flex; flex-direction: row;">
                <div style="width: 45%;  ${pickBetween("font-size: 9px;", "font-size: 12px;", "font-size: 12px;")}">  This is computer generated, No Signature Required </div>
                <div style="margin-left: 30%; width: 25%; font-size: 12px; text-align: right">TMD-I-OPS-017 </div>  
              </div>

              <div style="margin-left: 75%; width: 24%; font-size: 12px; text-align: right">Rev: 1 </div>  
            </div>

          </div>

        </div>
        
      </body>
    </html>
  `

  return htmlContent;
}