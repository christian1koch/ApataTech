import type {
  CURRENCIES,
  FIELD_TYPES,
  OPERATIONS,
  TRANSACTION_STATES,
} from "./constants";

export type Combinator = "AND" | "OR";
export type Operation = "EQUAL" | "NOT_EQUAL" | "LESS_THAN" | "GREATER_THAN";
export type Currency = (typeof CURRENCIES)[number];
export type TransactionState = (typeof TRANSACTION_STATES)[number];

export interface Money {
  amount: number;
  currency: Currency;
}

// Single source of truth: every field and the value type it holds
export interface FieldValueMap {
  amount: Money;
  name: string;
  id: string;
  transaction_state: TransactionState;
  device_ip: string;
  installments: number;
}

export type FieldName = keyof FieldValueMap;
export type FieldType = keyof typeof OPERATIONS;
export type OperationsFor<K extends FieldName> =
  (typeof OPERATIONS)[(typeof FIELD_TYPES)[K]][number];

export interface RuleFor<K extends FieldName> {
  fieldName: K;
  operation: OperationsFor<K>;
  value: FieldValueMap[K];
}

// Union of every valid rule, discriminated by fieldName
export type Rule = { [K in FieldName]: RuleFor<K> }[FieldName];

export interface Group {
  combinator: Combinator;
  subConditions: Condition[];
}

export type Condition = Rule | Group;

export interface Query {
  combinator: Combinator;
  conditions: Condition[];
}
