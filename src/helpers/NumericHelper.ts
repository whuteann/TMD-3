export const numberToTextGenerator = (number: number) => {
  var no = number;
  var string: string = "";
  var length = no.toString().length;
  var digits: Array<string> = [];
  while (no >= 1) {
    digits.push(((no % 10) | 0).toFixed(0));
    no = (no / 10);
  }
  var index = 0;
  var count = 1;
  while (index < length) {
    if (count == 4) {
      count = 1;
    }

    if (index == 3) {
      if (digits[3] == "0" && digits[4] == "0" && digits[5] == "0") {
        string = string;
      } else {
        string = "THOUSAND " + string;
      }
    }

    if (index == 6) {
      string = "MILLION " + string;
    }

    if (count == 3) {
      string = singleNumberToText(digits[index]) + (digits[index] == "0" ? "" : "HUNDRED ") + string;
    } else if (count == 2) {
      if (digits[index] == "0") {
        string = string;
      } else {
        string = toAddOrNotToAddAnd(index, length, digits) + tensNumberToText(digits[index]) + string;
      }
    } else {
      string = toAddOrNotToAddAndSingle(index, length, digits) + singleNumberToText(digits[index]) + string;
    }

    count += 1;
    index += 1;
  }

  let newStr = "";
  newStr = string.replace(/ten one/gi, 'ELEVEN ');
  newStr = newStr.replace(/ten two/gi, 'TWELVE ');
  newStr = newStr.replace(/ten three/gi, 'THIRTEEN ');
  newStr = newStr.replace(/ten four/gi, 'FOURTEEN ');
  newStr = newStr.replace(/ten five/gi, 'FIFTEEN ');
  newStr = newStr.replace(/ten six/gi, 'SIXTEEN ');
  newStr = newStr.replace(/ten seven/gi, 'SEVENTEEN ');
  newStr = newStr.replace(/ten eight/gi, 'EIGHTEEN ');
  newStr = newStr.replace(/ten nine/gi, 'NINTEEN ');
  return newStr;
}

const singleNumberToText = (digit: string) => {
  switch (digit) {
    case "1":
      return "ONE ";
    case "2":
      return "TWO ";
    case "3":
      return "THREE ";
    case "4":
      return "FOUR ";
    case "5":
      return "FIVE ";
    case "6":
      return "SIX ";
    case "7":
      return "SEVEN ";
    case "8":
      return "EIGHT ";
    case "9":
      return "NINE ";
    case "0":
      return "";
  }
}

const tensNumberToText = (digit: string) => {
  switch (digit) {
    case "1":
      return "TEN ";
    case "2":
      return "TWENTY ";
    case "3":
      return "THIRTY ";
    case "4":
      return "FORTY ";
    case "5":
      return "FIFTY ";
    case "6":
      return "SIXTY ";
    case "7":
      return "SEVENTY ";
    case "8":
      return "EIGHTY ";
    case "9":
      return "NINETY ";
    case "0":
      return "";
  }
}

const toAddOrNotToAddAnd = (index: number, length: number, digits: Array<string>) => {
  if (length < 3) {
    return "";
  } else {
    if ((index + 1) == length) {
      return "";
    } else {
      if (digits[index + 1] == "0") {
        if (index == 1) {
          return "AND ";
        } else {
          return "";
        }
      } else {
        return "AND ";
      }
    }
  }

}

const toAddOrNotToAddAndSingle = (index: number, length: number, digits: Array<string>) => {
  if (length < 3) {
    return "";
  } else {
    if ((index + 1) == length) {
      return "";
    } else {
      if (digits[index + 1] == "0") {
        return "AND ";
      } else {
        return "";
      }
    }
  }

}

export const getRandomNumber = (digits: number) => {
  let number: string = "";
  for (let i = digits; i > 0; i--) {
    number = number + (Math.floor(Math.random() * 10)).toString();
  }

  return number;
}

export const addCommaNumber = (number: string | undefined, onUndefinedValue: string) => {
  if (number) {
    if (isNaN(Number(number))) {
      return number;
    } else {
      return Number(number).toLocaleString();
    }
  } else {
    return onUndefinedValue;
  }
}