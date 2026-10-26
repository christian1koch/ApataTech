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
