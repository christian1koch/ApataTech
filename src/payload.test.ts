import { describe, expect, test } from "vitest";
import { toPayload } from "./payload";
import type { GroupNode, QueryNode, RuleNode } from "./queryReducer";
import type { Combinator, Query, Rule } from "./types";

const rule = (id: string, data: Rule): RuleNode => ({
  id,
  kind: "rule",
  rule: data,
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
