export type Combinator = "AND" | "OR";
export type FieldName =
	| "amount"
	| "name"
	| "id"
	| "transaction_state"
	| "device_ip"
	| "installments";
export type Operation = "EQUAL" | "NOT_EQUAL" | "LESS_THAN" | "GREATER_THAN";

export interface Money {
	amount: number;
	currency: string; // TODO: Revisit to see if an enum or a type needs to be created for currency
}
export type TransactionState =
	| "SUCCEEDED"
	| "REJECTED"
	| "ERROR"
	| "TIMEOUT"
	| "CANCELLED"
	| "FAILED"
	| "ABORTED";
export type Value = string | number | Money | TransactionState; // TODO: Check a better way to conditionally check the value depending on FieldName, issue #5

export interface Rule {
	fieldName: FieldName;
	operation: Operation;
	value: Value;
}

export interface Group {
	combinator: Combinator;
	subConditions: Condition[];
}

export type Condition = Rule | Group;

export interface Query {
	combinator: Combinator;
	conditions: Condition[];
}
