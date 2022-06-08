export type Currencies = "MYR" | "USD" | "SGD";

export const CurrenciesList = ["MYR", "USD", "SGD"];

export const convertCurrency = (currency: Currencies) => {
  switch (currency) {
    case "MYR":
      return "RM";
    case "USD":
      return "$";
    case "SGD":
      return "S$";
    default:
      return "";
  }
}

export const convertCurrencyText = (currency: Currencies) => {
  switch (currency) {
    case "MYR":
      return "RINGGIT MALAYSIA";
    case "USD":
      return "US DOLLAR";
    case "SGD":
      return "SINGAPORE DOLLAR";
    default:
      return "";
  }
}