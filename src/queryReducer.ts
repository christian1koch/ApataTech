import { createRule } from "./fields";
import type { Combinator, Rule } from "./types";

// The rule is nested rather than spread so UI-only state added to the node
// later can never leak into the payload
export interface RuleNode {
  id: string;
  kind: "rule";
  rule: Rule;
}

export interface GroupNode {
  id: string;
  kind: "group";
  combinator: Combinator;
  children: QueryNode[];
}

export type QueryNode = RuleNode | GroupNode;

export type QueryAction =
  | { type: "addRule"; groupId: string }
  | { type: "addGroup"; groupId: string }
  | { type: "updateRule"; id: string; rule: Rule }
  | { type: "setCombinator"; groupId: string; combinator: Combinator }
  | { type: "remove"; id: string };

export const createRuleNode = (): RuleNode => ({
  id: crypto.randomUUID(),
  kind: "rule",
  rule: createRule("name"),
});

// Groups are never empty: they start with a rule and their last child can't be
// removed, so every group in the payload has at least one condition
export const createGroup = (): GroupNode => ({
  id: crypto.randomUUID(),
  kind: "group",
  combinator: "AND",
  children: [createRuleNode()],
});

export const createInitialQuery = createGroup;

// Returns a copy of the tree with the node matching `id` replaced by the
// result of `update`.
function updateNode(
  node: QueryNode,
  id: string,
  update: (node: QueryNode) => QueryNode
): QueryNode {
  if (node.id === id) return update(node);
  if (node.kind === "rule") return node;
  return {
    ...node,
    children: node.children.map((child) => updateNode(child, id, update)),
  };
}

// Returns a copy of the group with the node matching `id` removed at any
// depth. The group passed in is never removed itself, and neither is a
// group's last child.
function removeNode(group: GroupNode, id: string): GroupNode {
  const remaining = group.children.filter((child) => child.id !== id);
  return {
    ...group,
    children: (remaining.length > 0 ? remaining : group.children).map(
      (child) => (child.kind === "group" ? removeNode(child, id) : child)
    ),
  };
}

function updateGroup(
  root: GroupNode,
  groupId: string,
  update: (group: GroupNode) => GroupNode
): GroupNode {
  const result = updateNode(root, groupId, (node) =>
    node.kind === "group" ? update(node) : node
  );
  return result.kind === "group" ? result : root;
}

export function queryReducer(state: GroupNode, action: QueryAction): GroupNode {
  switch (action.type) {
    case "addRule":
      // Insert after the last rule so rules always come before nested groups
      return updateGroup(state, action.groupId, (group) => {
        const firstGroupIndex = group.children.findIndex(
          (child) => child.kind === "group"
        );
        const insertAt =
          firstGroupIndex === -1 ? group.children.length : firstGroupIndex;
        return {
          ...group,
          children: group.children.toSpliced(insertAt, 0, createRuleNode()),
        };
      });
    case "addGroup":
      return updateGroup(state, action.groupId, (group) => ({
        ...group,
        children: [...group.children, createGroup()],
      }));
    case "setCombinator":
      return updateGroup(state, action.groupId, (group) => ({
        ...group,
        combinator: action.combinator,
      }));
    case "updateRule": {
      const result = updateNode(state, action.id, (node) =>
        node.kind === "rule" ? { ...node, rule: action.rule } : node
      );
      return result.kind === "group" ? result : state;
    }
    case "remove":
      return removeNode(state, action.id);
  }
}
