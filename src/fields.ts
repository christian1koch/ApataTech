import type { ComponentType } from "react";
import { FIELD_TYPES, OPERATIONS, TRANSACTION_STATES } from "./constants";
import type {
  FieldName,
  FieldValueMap,
  Operation,
  OperationsFor,
  Rule,
  RuleFor,
} from "./types";
import IntegerWidget from "./widgets/IntegerWidget";
import MoneyWidget from "./widgets/MoneyWidget";
import SelectWidget from "./widgets/SelectWidget";
import TextWidget from "./widgets/TextWidget";
import type { WidgetProps } from "./widgets/types";

export interface FieldConfig<K extends FieldName> {
  label: string;
  defaultValue: FieldValueMap[K];
  Widget: ComponentType<WidgetProps<FieldValueMap[K]>>;
  options?: readonly FieldValueMap[K][];
}

// Mapped over FieldName so TS knows FIELDS[k] is a FieldConfig<k>, which ties
// each field's Widget to its value type
export const FIELDS: { [K in FieldName]: FieldConfig<K> } = {
  amount: {
    label: "Amount",
    defaultValue: { amount: 0, currency: "USD" },
    Widget: MoneyWidget,
  },
  name: { label: "Name", defaultValue: "", Widget: TextWidget },
  id: { label: "ID", defaultValue: "", Widget: TextWidget },
  transaction_state: {
    label: "Transaction state",
    defaultValue: "SUCCEEDED",
    Widget: SelectWidget,
    options: TRANSACTION_STATES,
  },
  device_ip: { label: "Device IP", defaultValue: "", Widget: TextWidget },
  installments: {
    label: "Installments",
    defaultValue: 1,
    Widget: IntegerWidget,
  },
};

export const FIELD_NAMES = Object.keys(FIELDS) as FieldName[];

export const getOperations = <K extends FieldName>(
  fieldName: K
): readonly OperationsFor<K>[] => OPERATIONS[FIELD_TYPES[fieldName]];

// Builds a valid rule for `fieldName`, keeping `operation` if the field
// supports it
export function createRule<K extends FieldName>(
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

// TS can't prove that a generic RuleFor<K> is a member of the Rule union
// (it can for every concrete K), so this is the one contained cast.
export const toRule = <K extends FieldName>(rule: RuleFor<K>): Rule =>
  rule as Rule;
