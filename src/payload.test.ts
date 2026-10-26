import { describe, expect, test } from "vitest";
import { fromPayload, toPayload } from "./payload";
import type { GroupNode, QueryNode, RuleNode } from "./queryReducer";
import type { Combinator, Query, Rule } from "./types";

const rule = (id: string, data: Rule): RuleNode => ({
  id,
  kind: "rule",
  ...data,
});

const group = (
  id: string,
  combinator: Combinator,
  children: QueryNode[]
): GroupNode => ({ id, kind: "group", combinator, children });

// Example 1 from the brief
const singleRulePayload: Query = {
  combinator: "AND",
  conditions: [{ fieldName: "name", operation: "EQUAL", value: "john" }],
};

// Example 2 from the brief
const nestedPayload: Query = {
  combinator: "AND",
  conditions: [
    { fieldName: "name", operation: "EQUAL", value: "john" },
    {
      combinator: "AND",
      subConditions: [
        { fieldName: "id", operation: "EQUAL", value: "123" },
        {
          fieldName: "amount",
          operation: "EQUAL",
          value: { amount: 10, currency: "EUR" },
        },
      ],
    },
  ],
};

const collectIds = (node: QueryNode): string[] =>
  node.kind === "rule"
    ? [node.id]
    : [node.id, ...node.children.flatMap(collectIds)];

describe("toPayload", () => {
  test("converts a single rule", () => {
    const tree = group("root", "AND", [
      rule("r1", { fieldName: "name", operation: "EQUAL", value: "john" }),
    ]);

    expect(toPayload(tree)).toStrictEqual(singleRulePayload);
  });

  test("converts a nested group into subConditions", () => {
    const tree = group("root", "AND", [
      rule("r1", { fieldName: "name", operation: "EQUAL", value: "john" }),
      group("g1", "AND", [
        rule("r2", { fieldName: "id", operation: "EQUAL", value: "123" }),
        rule("r3", {
          fieldName: "amount",
          operation: "EQUAL",
          value: { amount: 10, currency: "EUR" },
        }),
      ]),
    ]);

    expect(toPayload(tree)).toStrictEqual(nestedPayload);
  });

  test("keeps each group's combinator at every depth", () => {
    const tree = group("root", "OR", [
      group("g1", "AND", [
        group("g2", "OR", [
          rule("r1", {
            fieldName: "installments",
            operation: "GREATER_THAN",
            value: 12,
          }),
        ]),
      ]),
    ]);

    expect(toPayload(tree)).toStrictEqual({
      combinator: "OR",
      conditions: [
        {
          combinator: "AND",
          subConditions: [
            {
              combinator: "OR",
              subConditions: [
                {
                  fieldName: "installments",
                  operation: "GREATER_THAN",
                  value: 12,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("converts an empty root and empty nested groups", () => {
    const tree = group("root", "AND", [group("g1", "OR", [])]);

    expect(toPayload(tree)).toStrictEqual({
      combinator: "AND",
      conditions: [{ combinator: "OR", subConditions: [] }],
    });
  });
});

describe("fromPayload", () => {
  test("creates rule and group nodes with the payload's data", () => {
    const tree = fromPayload(nestedPayload);

    expect(tree).toMatchObject({
      kind: "group",
      combinator: "AND",
      children: [
        { kind: "rule", fieldName: "name", operation: "EQUAL", value: "john" },
        {
          kind: "group",
          combinator: "AND",
          children: [
            { kind: "rule", fieldName: "id", value: "123" },
            {
              kind: "rule",
              fieldName: "amount",
              value: { amount: 10, currency: "EUR" },
            },
          ],
        },
      ],
    });
  });

  test("gives every node a unique id", () => {
    const ids = collectIds(fromPayload(nestedPayload));

    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("round trip", () => {
  test.each([
    ["a single rule", singleRulePayload],
    ["a nested group", nestedPayload],
  ])("toPayload(fromPayload(x)) returns x for %s", (_, payload) => {
    expect(toPayload(fromPayload(payload))).toStrictEqual(payload);
  });
});
