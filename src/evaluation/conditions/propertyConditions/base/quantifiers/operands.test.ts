import { describe, expect, test } from "@jest/globals";

import type { NumberCondition } from "../../../../../schema/conditions/NumberCondition";
import type { Quantifier } from "../../../../../schema/conditions/Quantifier";
import { evaluateWithOperandsQuantifier } from "./operands";

describe("evaluateWithOperandsQuantifier", () => {
  describe("Quantifier = some", () => {
    const operandsQuantifier: Quantifier = "some";

    test("Returns false for empty operands array", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns false for all operands evaluating to false", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns true for a single operand evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3, 4, 5, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });

    test("Returns true for all operands evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [42, 42, 42, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });
  });

  describe("Quantifier = every", () => {
    const operandsQuantifier: Quantifier = "every";

    test("Returns false for empty operands array", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns false for all operands evaluating to false", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns false for a single operand evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3, 4, 5, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns true for all operands evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [42, 42, 42, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });
  });

  describe("Quantifier = notAny", () => {
    const operandsQuantifier: Quantifier = "notAny";

    test("Returns false for empty operands array", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns true for all operands evaluating to false", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });

    test("Returns false for a single operand evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3, 4, 5, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns false for all operands evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [42, 42, 42, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });
  });

  describe("Quantifier = notEvery", () => {
    const operandsQuantifier: Quantifier = "notEvery";

    test("Returns false for empty operands array", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });

    test("Returns true for all operands evaluating to false", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });

    test("Returns true for a single operand evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [1, 2, 3, 4, 5, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(true);
    });

    test("Returns false for all operands evaluating to true", () => {
      const condition: NumberCondition = {
        type: "number",
        operandsQuantifier,
        operator: "equals",
        operands: [42, 42, 42, 42],
        propertyId: "any",
      };

      expect(
        evaluateWithOperandsQuantifier(condition, (operand) => operand === 42),
      ).toBe(false);
    });
  });
});
