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
