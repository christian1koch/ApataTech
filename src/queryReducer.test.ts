import { describe, expect, test } from "vitest";
import { createInitialQuery, queryReducer, type GroupNode } from "./queryReducer";

const childAt = (group: GroupNode, index: number) => group.children[index];

describe("groups are never empty", () => {
  test("a new group starts with a rule", () => {
    const root = createInitialQuery();
    const state = queryReducer(root, { type: "addGroup", groupId: root.id });

    const group = childAt(state, 1);
    expect(group.kind).toBe("group");
    expect(group.kind === "group" && group.children).toHaveLength(1);
  });

  test("removing a group's only child does nothing", () => {
    const root = createInitialQuery();
    const state = queryReducer(root, {
      type: "remove",
      id: childAt(root, 0).id,
    });

    expect(state.children).toEqual(root.children);
  });

  test("removing one of several children works", () => {
    const root = createInitialQuery();
    const withTwo = queryReducer(root, { type: "addRule", groupId: root.id });
    const state = queryReducer(withTwo, {
      type: "remove",
      id: childAt(withTwo, 0).id,
    });

    expect(state.children).toEqual([childAt(withTwo, 1)]);
  });
});
