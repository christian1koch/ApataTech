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
import { createIntegerWidget } from "../components/widgets/IntegerWidget";
import MoneyWidget from "../components/widgets/MoneyWidget";
import { createSelectWidget } from "../components/widgets/SelectWidget";
import { createTextWidget } from "../components/widgets/TextWidget";
import type { WidgetProps } from "../components/widgets/types";

export interface FieldConfig<K extends FieldName> {
  label: string;
  defaultValue: FieldValueMap[K];
  Widget: ComponentType<WidgetProps<FieldValueMap[K]>>;
}

// NaN number defaults render as empty required inputs
export const FIELDS: { [K in FieldName]: FieldConfig<K> } = {
  amount: {
    label: "Amount",
    defaultValue: { amount: NaN, currency: "USD" },
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
      hint: "IPv4, e.g. 192.168.1.1",
    }),
  },
  installments: {
    label: "Installments",
    defaultValue: NaN,
    Widget: createIntegerWidget({ min: 1 }),
  },
};

export const FIELD_NAMES = Object.keys(FIELDS) as FieldName[];

export function getOperations<K extends FieldName>(
  fieldName: K,
): readonly OperationsFor<K>[] {
  return OPERATIONS[FIELD_TYPES[fieldName]];
}

function buildRule<K extends FieldName>(
  fieldName: K,
  operation?: Operation,
): RuleFor<K> {
  const allowed = getOperations(fieldName);
  return {
    fieldName,
    operation: allowed.find((op) => op === operation) ?? allowed[0],
    value: FIELDS[fieldName].defaultValue,
  };
}

// TS can't prove a generic RuleFor<K> is a member of the Rule union
export function createRule(fieldName: FieldName, operation?: Operation) {
  return buildRule(fieldName, operation) as Rule;
}

export function changeField(rule: Rule, fieldName: FieldName): Rule {
  const next = createRule(fieldName, rule.operation);
  const bothText =
    FIELD_TYPES[rule.fieldName] === "text" && FIELD_TYPES[fieldName] === "text";
  return bothText ? ({ ...next, value: rule.value } as Rule) : next;
}
