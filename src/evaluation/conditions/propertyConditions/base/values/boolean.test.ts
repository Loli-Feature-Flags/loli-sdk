import { describe, expect, test } from "@jest/globals";

import { evaluateBooleanValueAndOperator } from "./boolean";

describe("evaluateBooleanValueAndOperator", () => {
  describe("Operator isTrue", () => {
    test("Returns true for a value = true", () => {
      expect(evaluateBooleanValueAndOperator(true, "isTrue")).toEqual(true);
    });

    test("Returns false for a value = false", () => {
      expect(evaluateBooleanValueAndOperator(false, "isTrue")).toEqual(false);
    });
  });

  describe("Operator isFalse", () => {
    test("Returns true for a value = false", () => {
      expect(evaluateBooleanValueAndOperator(false, "isFalse")).toEqual(true);
    });

    test("Returns false for a value = true", () => {
      expect(evaluateBooleanValueAndOperator(true, "isFalse")).toEqual(false);
    });
  });
});
