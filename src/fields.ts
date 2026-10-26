import type { ComponentType } from "react";
import {
  FIELD_TYPES,
  IPV4_PATTERN,
  OPERATIONS,
  TRANSACTION_STATES,
} from "./constants";
import type {
  FieldName,
  FieldValueMap,
  Operation,
  OperationsFor,
  Rule,
  RuleFor,
} from "./types";
import { createIntegerWidget } from "./widgets/IntegerWidget";
import MoneyWidget from "./widgets/MoneyWidget";
import { createSelectWidget } from "./widgets/SelectWidget";
import { createTextWidget } from "./widgets/TextWidget";
import type { WidgetProps } from "./widgets/types";

export interface FieldConfig<K extends FieldName> {
  label: string;
  defaultValue: FieldValueMap[K];
  Widget: ComponentType<WidgetProps<FieldValueMap[K]>>;
}

// Mapped over FieldName so TS knows FIELDS[k] is a FieldConfig<k>, which ties
// each field's Widget to its value type
export const FIELDS: { [K in FieldName]: FieldConfig<K> } = {
  amount: {
    label: "Amount",
    defaultValue: { amount: 0, currency: "USD" },
    Widget: MoneyWidget,
  },
  name: { label: "Name", defaultValue: "", Widget: createTextWidget() },
  id: { label: "ID", defaultValue: "", Widget: createTextWidget() },
  transaction_state: {
    label: "Transaction state",
    defaultValue: "SUCCEEDED",
    Widget: createSelectWidget(TRANSACTION_STATES),
  },
  device_ip: {
    label: "Device IP",
    defaultValue: "",
    Widget: createTextWidget({
      pattern: IPV4_PATTERN,
      hint: "Enter an IPv4 address, e.g. 192.168.1.1",
    }),
  },
  installments: {
    label: "Installments",
    defaultValue: 1,
    Widget: createIntegerWidget({ min: 1 }),
  },
};

export const FIELD_NAMES = Object.keys(FIELDS) as FieldName[];

export const getOperations = <K extends FieldName>(
  fieldName: K
): readonly OperationsFor<K>[] => OPERATIONS[FIELD_TYPES[fieldName]];

function buildRule<K extends FieldName>(
  fieldName: K,
  operation?: Operation
): RuleFor<K> {
  const allowed = getOperations(fieldName);
  return {
    fieldName,
    operation: allowed.find((op) => op === operation) ?? allowed[0],
    value: FIELDS[fieldName].defaultValue,
  };
}

// Builds a valid rule for `fieldName`, keeping `operation` if the field
// supports it. buildRule is type-checked per field; the cast is only needed
// because TS can't prove a generic RuleFor<K> is a member of the Rule union.
export const createRule = (fieldName: FieldName, operation?: Operation) =>
  buildRule(fieldName, operation) as Rule;
