import { CBM, CBM_SINGULAR, KILOLITRE, KILOLITRES, LITRE, LITRES, METRIC_TONNE, METRIC_TONNES } from "./Units";


// - 1 Metric Tonne = 1180 Litre
// - 1 CBM = 1000.00 Litre = 1 Kilolitre

export const convertValue = (first: string, second: string, value: number) => {
  const convertString = `${first} to ${second}`;
  let convertedValue: number = 0
  switch (convertString) {
    //Litres
    case `${LITRES} to ${LITRE}`:
      convertedValue = value;
      break;
    case `${LITRES} to ${METRIC_TONNE}`:
      convertedValue = value / 1180;
      break;
    case `${LITRES} to ${CBM_SINGULAR}`:
      convertedValue = value / 1000;
      break;
    case `${LITRES} to ${KILOLITRE}`:
      convertedValue = value / 1000;
      break;
    case `${LITRE} to ${LITRE}`:
      convertedValue = value;
      break;
    case `${LITRE} to ${METRIC_TONNE}`:
      convertedValue = value / 1180;
      break;
    case `${LITRE} to ${CBM_SINGULAR}`:
      convertedValue = value / 1000;
      break;
    case `${LITRE} to ${KILOLITRE}`:
      convertedValue = value / 1000;
      break;

    //Metric Tonnes
    case `${METRIC_TONNES} to ${LITRE}`:
      convertedValue = value * 1180;
      break;
    case `${METRIC_TONNES} to ${METRIC_TONNE}`:
      convertedValue = value;
      break;
    case `${METRIC_TONNES} to ${CBM_SINGULAR}`:
      convertedValue = (value * 1180) / 1000;
      break;
    case `${METRIC_TONNES} to ${KILOLITRE}`:
      convertedValue = (value * 1180) / 1000;
      break;
    case `${METRIC_TONNE} to ${LITRE}`:
      convertedValue = value * 1180;
      break;
    case `${METRIC_TONNE} to ${METRIC_TONNE}`:
      convertedValue = value;
      break;
    case `${METRIC_TONNE} to ${CBM_SINGULAR}`:
      convertedValue = (value * 1180) / 1000;
      break;
    case `${METRIC_TONNE} to ${KILOLITRE}`:
      convertedValue = (value * 1180) / 1000;
      break;

    //CBM
    case `${CBM} to ${LITRE}`:
      convertedValue = value * 1000;
      break;
    case `${CBM} to ${METRIC_TONNE}`:
      convertedValue = (value * 1000) / 1180;
      break;
    case `${CBM} to ${CBM_SINGULAR}`:
      convertedValue = value;
      break;
    case `${CBM} to ${KILOLITRE}`:
      convertedValue = value;
      break;
    case `${CBM_SINGULAR} to ${LITRE}`:
      convertedValue = value * 1000;
      break;
    case `${CBM_SINGULAR} to ${METRIC_TONNE}`:
      convertedValue = (value * 1000) / 1180;
      break;
    case `${CBM_SINGULAR} to ${CBM_SINGULAR}`:
      convertedValue = value;
      break;
    case `${CBM_SINGULAR} to ${KILOLITRE}`:
      convertedValue = value;
      break;

    //Kililitres
    case `${KILOLITRES} to ${LITRE}`:
      convertedValue = value * 1000;
      break;
    case `${KILOLITRES} to ${METRIC_TONNE}`:
      convertedValue = (value * 1000) / 1180;
      break;
    case `${KILOLITRES} to ${CBM_SINGULAR}`:
      convertedValue = value;
      break;
    case `${KILOLITRES} to ${KILOLITRE}`:
      convertedValue = value;
      break;
    case `${KILOLITRE} to ${LITRE}`:
      convertedValue = value * 1000;
      break;
    case `${KILOLITRE} to ${METRIC_TONNE}`:
      convertedValue = (value * 1000) / 1180;
      break;
    case `${KILOLITRE} to ${CBM_SINGULAR}`:
      convertedValue = value;
      break;
    case `${KILOLITRE} to ${KILOLITRE}`:
      convertedValue = value;
      break;
  }

  return convertedValue;
}