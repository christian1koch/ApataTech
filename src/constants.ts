import type { FieldName, FieldType, Operation } from "./types";

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;

export const TRANSACTION_STATES = [
  "SUCCEEDED",
  "REJECTED",
  "ERROR",
  "TIMEOUT",
  "CANCELLED",
  "FAILED",
  "ABORTED",
] as const;

// HTML `pattern` values: the browser anchors them to the whole input
export const NON_BLANK_PATTERN = String.raw`.*\S.*`;
const IPV4_OCTET = String.raw`(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)`;
export const IPV4_PATTERN = String.raw`(${IPV4_OCTET}\.){3}${IPV4_OCTET}`;

export const OPERATION_LABELS: Record<Operation, string> = {
  EQUAL: "is",
  NOT_EQUAL: "is not",
  LESS_THAN: "less than",
  GREATER_THAN: "greater than",
};

export const OPERATIONS = {
  text: ["EQUAL", "NOT_EQUAL"],
  number: ["EQUAL", "NOT_EQUAL", "LESS_THAN", "GREATER_THAN"],
  enum: ["EQUAL", "NOT_EQUAL"],
} as const satisfies Record<string, readonly Operation[]>;

export const FIELD_TYPES = {
  amount: "number",
  name: "text",
  id: "text",
  transaction_state: "enum",
  device_ip: "text",
  installments: "number",
} as const satisfies Record<FieldName, FieldType>;
