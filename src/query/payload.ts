import type { GroupNode, QueryNode } from "./queryReducer";
import type { Condition, Query, Rule } from "./types";

// UI tree -> backend schema
const toCondition = (node: QueryNode): Condition => {
  if (node.kind === "group") {
    return {
      combinator: node.combinator,
      subConditions: node.children.map(toCondition),
    };
  }
  return trimValue(node.rule);
};

function trimValue(rule: Rule): Rule {
  switch (rule.fieldName) {
    case "name":
    case "id":
    case "device_ip":
      return { ...rule, value: rule.value.trim() };
    default:
      return rule;
  }
}

export const toPayload = (root: GroupNode): Query => ({
  combinator: root.combinator,
  conditions: root.children.map(toCondition),
});
