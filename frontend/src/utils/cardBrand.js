export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function detectCardBrand(numberDigits) {
  const n = digitsOnly(numberDigits);
  if (/^3[47]/.test(n)) return "american express";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|22[2-9]|2[3-7])/.test(n)) return "mastercard";
  if (/^6(?:011|5)/.test(n)) return "discover";
  if (/^3(?:0[0-5]|[689])/.test(n)) return "diners";
  if (/^(?:2131|1800)/.test(n)) return "jcb15";
  if (/^35/.test(n)) return "jcb";
  if (/^(?:5[0678]|6304|67)/.test(n)) return "maestro";
  if (/^62/.test(n)) return "unionpay";
  return "unknown";
}

export const CARD_COLOR_CLASS = {
  visa: "lightblue",
  mastercard: "lightblue",
  "american express": "green",
  discover: "purple",
  diners: "orange",
  jcb: "red",
  jcb15: "red",
  maestro: "yellow",
  unionpay: "cyan",
  unknown: "grey",
};

export function brandLabel(brand) {
  const map = {
    visa: "Visa",
    mastercard: "Mastercard",
    "american express": "Amex",
    discover: "Discover",
    diners: "Diners",
    jcb: "JCB",
    maestro: "Maestro",
    unionpay: "UnionPay",
    unknown: "Card",
  };
  return map[brand] ?? "Card";
}
