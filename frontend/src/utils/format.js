// Indian (INR) formatting helpers for the EPS frontend.
// Amounts are stored as numbers in the backend; formatting happens only here.

const INDIAN_NUMBER_REGEX = /(\d)(?=(\d\d)+\d$)/g;

/**
 * Formats a number using Indian digit grouping, e.g. 125000 -> "1,25,000".
 * Pass decimals > 0 to keep a fixed number of fraction digits.
 */
export const formatIndianNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === "") return "0";
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  const [intPart, fracPart] = num.toFixed(decimals).split(".");
  const grouped = intPart.replace(INDIAN_NUMBER_REGEX, "$1,");
  return decimals > 0 ? `${grouped}.${fracPart}` : grouped;
};

/**
 * Formats a number as an Indian Rupee amount, e.g. 125000 -> "₹1,25,000.00".
 */
export const formatINR = (value, { symbol = true, decimals = 2 } = {}) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return symbol ? "₹0.00" : "0.00";
  const [intPart, fracPart] = num.toFixed(decimals).split(".");
  const grouped = intPart.replace(INDIAN_NUMBER_REGEX, "$1,");
  const body = decimals > 0 ? `${grouped}.${fracPart}` : grouped;
  return symbol ? `₹${body}` : body;
};

/**
 * Formats a date string/Date into an Indian-friendly display format, e.g. "10-Aug-2026, 04:30 PM".
 * Falls back to the raw value for invalid inputs.
 */
export const formatDateIN = (value, { withTime = true } = {}) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  if (!withTime) return `${day}-${month}-${year}`;
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${day}-${month}-${year}, ${time}`;
};

/**
 * Formats a plain integer count with Indian grouping (no currency), e.g. 125000 -> "1,25,000".
 */
export const formatCount = (value) => formatIndianNumber(value, 0);
