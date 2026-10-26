import type { GroupNode, QueryNode } from "./queryReducer";
import type { Condition, Query } from "./types";

// UI tree -> backend schema

const toCondition = (node: QueryNode): Condition => {
  if (node.kind === "group") {
    return {
      combinator: node.combinator,
      subConditions: node.children.map(toCondition),
    };
  }
  return node.rule;
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
    : { id: crypto.randomUUID(), kind: "rule", rule: condition };

export const fromPayload = (query: Query): GroupNode => ({
  id: crypto.randomUUID(),
  kind: "group",
  combinator: query.combinator,
  children: query.conditions.map(fromCondition),
});
