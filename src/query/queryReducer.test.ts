import { describe, expect, test } from "vitest";
import {
  createInitialQuery,
  queryReducer,
  type GroupNode,
  type QueryNode,
  type RuleNode,
} from "./queryReducer";

const asGroup = (node: QueryNode): GroupNode => {
  if (node.kind !== "group") throw new Error("Expected a group");
  return node;
};

const asRule = (node: QueryNode): RuleNode => {
  if (node.kind !== "rule") throw new Error("Expected a rule");
  return node;
};

const kinds = (group: GroupNode) => group.children.map((child) => child.kind);

// root (AND)
// ├─ rule
// └─ group (AND)
//    └─ rule
function nestedTree() {
  const initial = createInitialQuery();
  const root = queryReducer(initial, { type: "addGroup", groupId: initial.id });
  const group = asGroup(root.children[1]);
  return {
    root,
    group,
    rootRule: asRule(root.children[0]),
    nestedRule: asRule(group.children[0]),
  };
}

describe("addRule", () => {
  test("adds a rule to the target group only", () => {
    const { root, group } = nestedTree();
    const state = queryReducer(root, { type: "addRule", groupId: group.id });

    expect(kinds(asGroup(state.children[1]))).toEqual(["rule", "rule"]);
    expect(kinds(state)).toEqual(["rule", "group"]);
  });

  test("appends the rule to the end of the group, after nested groups", () => {
    const { root } = nestedTree();
    const state = queryReducer(root, { type: "addRule", groupId: root.id });

    expect(kinds(state)).toEqual(["rule", "group", "rule"]);
  });

  test("ignores an id that isn't a group", () => {
    const { root, rootRule } = nestedTree();
    const state = queryReducer(root, { type: "addRule", groupId: rootRule.id });

    expect(state).toEqual(root);
  });
});

describe("addGroup", () => {
  test("appends a group that starts with one rule", () => {
    const { root, group } = nestedTree();
    const state = queryReducer(root, { type: "addGroup", groupId: group.id });

    const nested = asGroup(state.children[1]);
    expect(kinds(nested)).toEqual(["rule", "group"]);
    expect(kinds(asGroup(nested.children[1]))).toEqual(["rule"]);
  });

  test("nests to any depth", () => {
    const deepest = (group: GroupNode): GroupNode => {
      const last = group.children.at(-1);
      return last?.kind === "group" ? deepest(last) : group;
    };
    const depth = (group: GroupNode): number =>
      deepest(group) === group ? 0 : 1 + depth(asGroup(group.children.at(-1)!));

    let state = createInitialQuery();
    for (let i = 0; i < 4; i++) {
      state = queryReducer(state, {
        type: "addGroup",
        groupId: deepest(state).id,
      });
    }

    expect(depth(state)).toBe(4);
  });
});

describe("setCombinator", () => {
  test("changes only the target group", () => {
    const { root, group } = nestedTree();
    const state = queryReducer(root, {
      type: "setCombinator",
      groupId: group.id,
      combinator: "OR",
    });

    expect(state.combinator).toBe("AND");
    expect(asGroup(state.children[1]).combinator).toBe("OR");
  });
});

describe("updateRule", () => {
  test("replaces only the target rule", () => {
    const { root, rootRule, nestedRule } = nestedTree();
    const rule = { fieldName: "id", operation: "EQUAL", value: "123" } as const;
    const state = queryReducer(root, {
      type: "updateRule",
      id: nestedRule.id,
      rule,
    });

    expect(asGroup(state.children[1]).children[0]).toEqual({
      ...nestedRule,
      rule,
    });
    expect(state.children[0]).toBe(rootRule);
  });

  test("ignores an id that isn't a rule", () => {
    const { root, group } = nestedTree();
    const state = queryReducer(root, {
      type: "updateRule",
      id: group.id,
      rule: { fieldName: "id", operation: "EQUAL", value: "123" },
    });

    expect(state).toEqual(root);
  });
});

describe("remove", () => {
  test("removes a nested rule that has siblings", () => {
    const { root, group, nestedRule } = nestedTree();
    const withTwo = queryReducer(root, { type: "addRule", groupId: group.id });
    const state = queryReducer(withTwo, { type: "remove", id: nestedRule.id });

    const nested = asGroup(state.children[1]);
    expect(nested.children).toHaveLength(1);
    expect(nested.children[0].id).not.toBe(nestedRule.id);
  });

  test("removes a nested group with everything inside it", () => {
    const { root, group } = nestedTree();
    const state = queryReducer(root, { type: "remove", id: group.id });

    expect(kinds(state)).toEqual(["rule"]);
  });

  test("doesn't remove the root's only child", () => {
    const root = createInitialQuery();
    const state = queryReducer(root, {
      type: "remove",
      id: root.children[0].id,
    });

    expect(state).toEqual(root);
  });

  test("doesn't remove a nested group's only child", () => {
    const { root, nestedRule } = nestedTree();
    const state = queryReducer(root, { type: "remove", id: nestedRule.id });

    expect(state).toEqual(root);
  });

  test("ignores an unknown id", () => {
    const { root } = nestedTree();
    const state = queryReducer(root, { type: "remove", id: "missing" });

    expect(state).toEqual(root);
  });
});

test("never mutates the previous state", () => {
  const { root, group, nestedRule } = nestedTree();
  const snapshot = structuredClone(root);

  queryReducer(root, { type: "addRule", groupId: group.id });
  queryReducer(root, { type: "addGroup", groupId: root.id });
  queryReducer(root, {
    type: "setCombinator",
    groupId: group.id,
    combinator: "OR",
  });
  queryReducer(root, {
    type: "updateRule",
    id: nestedRule.id,
    rule: { fieldName: "id", operation: "EQUAL", value: "123" },
  });
  queryReducer(root, { type: "remove", id: group.id });

  expect(root).toEqual(snapshot);
});
