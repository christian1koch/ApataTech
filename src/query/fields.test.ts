import { describe, expect, test } from "vitest";
import {
  changeField,
  createRule,
  FIELD_NAMES,
  FIELDS,
  getOperations,
} from "./fields";
import type { Rule } from "./types";

describe("getOperations", () => {
  test.each([
    ["name", ["EQUAL", "NOT_EQUAL"]],
    ["id", ["EQUAL", "NOT_EQUAL"]],
    ["device_ip", ["EQUAL", "NOT_EQUAL"]],
    ["transaction_state", ["EQUAL", "NOT_EQUAL"]],
    ["amount", ["EQUAL", "NOT_EQUAL", "LESS_THAN", "GREATER_THAN"]],
    ["installments", ["EQUAL", "NOT_EQUAL", "LESS_THAN", "GREATER_THAN"]],
  ] as const)("%s supports %j", (fieldName, operations) => {
    expect(getOperations(fieldName)).toEqual(operations);
  });
});

describe("createRule", () => {
  test.each(FIELD_NAMES)(
    "%s starts with its default value and first operation",
    (fieldName) => {
      expect(createRule(fieldName)).toEqual({
        fieldName,
        operation: getOperations(fieldName)[0],
        value: FIELDS[fieldName].defaultValue,
      });
    }
  );

  test("keeps the operation when the new field supports it", () => {
    expect(createRule("installments", "LESS_THAN").operation).toBe("LESS_THAN");
    expect(createRule("transaction_state", "NOT_EQUAL").operation).toBe(
      "NOT_EQUAL"
    );
  });

  test("falls back to the first operation when it doesn't", () => {
    expect(createRule("name", "GREATER_THAN").operation).toBe("EQUAL");
  });
});

describe("changeField", () => {
  test("keeps the value between text fields", () => {
    const rule: Rule = { fieldName: "name", operation: "EQUAL", value: "john" };
    expect(changeField(rule, "id")).toEqual({
      fieldName: "id",
      operation: "EQUAL",
      value: "john",
    });
  });

  test.each([
    ["installments", "amount"],
    ["amount", "installments"],
    ["name", "transaction_state"],
    ["transaction_state", "name"],
  ] as const)("resets the value from %s to %s", (from, to) => {
    expect(changeField(createRule(from), to).value).toEqual(
      FIELDS[to].defaultValue
    );
  });

  test("keeps the operation when the new field supports it", () => {
    const rule = createRule("amount", "LESS_THAN");
    expect(changeField(rule, "installments").operation).toBe("LESS_THAN");
  });
});
