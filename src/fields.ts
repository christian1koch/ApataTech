import type { FieldName, Money, Operation, TransactionState } from "./types";

export type FieldType = "text" | "number" | "enum";
export type WidgetType = "text" | "number" | "integer" | "money" | "select";

export const OPERATIONS_BY_TYPE: Record<FieldType, readonly Operation[]> = {
  text: ["EQUAL", "NOT_EQUAL"],
  number: ["EQUAL", "NOT_EQUAL", "LESS_THAN", "GREATER_THAN"],
  enum: ["EQUAL", "NOT_EQUAL"],
};

export const TRANSACTION_STATES: readonly TransactionState[] = [
  "SUCCEEDED",
  "REJECTED",
  "ERROR",
  "TIMEOUT",
  "CANCELLED",
  "FAILED",
  "ABORTED",
];

export const CURRENCIES: readonly string[] = ["USD", "EUR", "GBP"];

export interface FieldConfig {
  label: string;
  type: FieldType;
  widget: WidgetType;
  defaultValue: string | number | Money;
  options?: readonly string[]; // only for "select" widgets
}

export const FIELDS: Record<FieldName, FieldConfig> = {
  amount: {
    label: "Amount",
    type: "number",
    widget: "money",
    defaultValue: { amount: 0, currency: "USD" },
  },
  name: { label: "Name", type: "text", widget: "text", defaultValue: "" },
  id: { label: "ID", type: "text", widget: "text", defaultValue: "" },
  transaction_state: {
    label: "Transaction state",
    type: "enum",
    widget: "select",
    options: TRANSACTION_STATES,
    defaultValue: "SUCCEEDED",
  },
  device_ip: {
    label: "Device IP",
    type: "text",
    widget: "text",
    defaultValue: "",
  },
  installments: {
    label: "Installments",
    type: "number",
    widget: "integer",
    defaultValue: 1,
  },
};

export const getOperations = (field: FieldName) =>
  OPERATIONS_BY_TYPE[FIELDS[field].type];
