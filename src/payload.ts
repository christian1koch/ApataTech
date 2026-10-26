import type { GroupNode, QueryNode } from "./queryReducer";
import type { Condition, Query } from "./types";

// UI tree -> backend schema

const toCondition = (node: QueryNode): Condition =>
  node.kind === "rule"
    ? {
        fieldName: node.fieldName,
        operation: node.operation,
        value: node.value,
      }
    : {
        combinator: node.combinator,
        subConditions: node.children.map(toCondition),
      };

export const toPayload = (root: GroupNode): Query => ({
  combinator: root.combinator,
  conditions: root.children.map(toCondition),
});

// Backend schema -> UI tree

const fromCondition = (condition: Condition): QueryNode =>
  "subConditions" in condition
    ? {
        id: crypto.randomUUID(),
        kind: "group",
        combinator: condition.combinator,
        children: condition.subConditions.map(fromCondition),
      }
    : {
        id: crypto.randomUUID(),
        kind: "rule",
        fieldName: condition.fieldName,
        operation: condition.operation,
        value: condition.value,
      };

export const fromPayload = (query: Query): GroupNode => ({
  id: crypto.randomUUID(),
  kind: "group",
  combinator: query.combinator,
  children: query.conditions.map(fromCondition),
});
