import { describe, expect, test } from "vitest";
import { createRule, FIELD_NAMES, FIELDS, getOperations } from "./fields";

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
