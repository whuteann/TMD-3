export const LITRES = "Litres"
export const METRIC_TONNES = "Metric Tonnes"
export const CBM = "CBM"
export const KILOLITRES = "Kilolitres"

export const UNITS_LIST = [LITRES, METRIC_TONNES, CBM, KILOLITRES]

export const LITRE = "Litre"
export const METRIC_TONNE = "Metric Tonne"
export const CBM_SINGULAR = "CBM"
export const KILOLITRE = "Kilolitre"

export const UNITS_LIST_SINGULAR = [LITRE, METRIC_TONNE, CBM_SINGULAR, KILOLITRE]

export const convertUnitShortHand = (unit: string) => {
  switch (unit) {
    case LITRE:
      return "LTR";
    case METRIC_TONNE:
      return "MT";
    case CBM_SINGULAR:
      return "CBM";
    case KILOLITRE:
      return "KLTR";
  }
}