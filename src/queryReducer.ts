import { FIELDS } from "./fields";
import type { Combinator, Rule } from "./types";

export type RuleNode = Rule & { id: string; kind: "rule" };

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

export const createRule = (): RuleNode => ({
  id: crypto.randomUUID(),
  kind: "rule",
  fieldName: "name",
  operation: "EQUAL",
  value: FIELDS.name.defaultValue,
});

export const createGroup = (): GroupNode => ({
  id: crypto.randomUUID(),
  kind: "group",
  combinator: "AND",
  children: [],
});

export const createInitialQuery = (): GroupNode => ({
  ...createGroup(),
  children: [createRule()],
});

// Returns a copy of the tree with the node matching `id` replaced by the
// result of `update`, or removed when `update` returns null.
function updateNode(
  node: QueryNode,
  id: string,
  update: (node: QueryNode) => QueryNode | null
): QueryNode | null {
  if (node.id === id) return update(node);
  if (node.kind === "rule") return node;
  return {
    ...node,
    children: node.children.flatMap((child) => {
      const updated = updateNode(child, id, update);
      return updated ? [updated] : [];
    }),
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
  return result?.kind === "group" ? result : root;
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
          children: group.children.toSpliced(insertAt, 0, createRule()),
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
        node.kind === "rule"
          ? { ...action.rule, id: node.id, kind: "rule" }
          : node
      );
      return result?.kind === "group" ? result : state;
    }
    case "remove": {
      // The root group itself can't be removed
      if (action.id === state.id) return state;
      const result = updateNode(state, action.id, () => null);
      return result?.kind === "group" ? result : state;
    }
  }
}
