import { pickBetween } from "../../../helpers/GenericHelper";

export function documentHeader(src) {
  let htmlContent: string = "";

  htmlContent = `
    <div style="width: 100%; display: flex; flex-direction: row; margin-bottom: 20px;">
        <img src="${src}" alt="Logo" style="width: 10%;height:10%;"/>
        
        <div style="width: 100%; display: flex; flex-direction: column; flex-wrap: wrap; margin-left: 10px;">
          <div style="display: flex; flex-direction: row; flex-wrap: wrap;">
            <div style="width: 84%; ${pickBetween("font-size: 15px;", "font-size: 20px;", "font-size: 20px;")} margin-top: 10px;  line-height: 0px"><b>TUMPUAN MEGAH DEVELOPMENT SDN BHD</b></div>
            <div style="width: 5%; font-size: 9px; margin-top: 10px;">(200901040866)</div>
          </div>
          <div style="width: 100%; ${pickBetween("font-size: 5px;", "font-size: 15px;", "font-size: 15px;")} ">49-01, Jalan Molek 2/1, Taman Molek, 81100 Johor Bahru, Johor, Malaysia</div>
          <div style="width: 100%; ${pickBetween("font-size: 5px;", "font-size: 15px;", "font-size: 15px;")}">Phone: 609-3584661 Fax: 609-3519660 Email: http://www.tmd-sb.com/</div>
        </div>  
      </div>
    `
  return htmlContent;
}