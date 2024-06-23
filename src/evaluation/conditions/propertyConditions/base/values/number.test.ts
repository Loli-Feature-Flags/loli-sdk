import { describe, expect, test } from "@jest/globals";

import type { NumberConditionOperator } from "../../../../../schema/conditions/NumberCondition";
import { evaluateNumberValueOperatorAndOperand } from "./number";

describe("evaluateNumberValueOperatorAndOperand", () => {
  const testCases: {
    [key in NumberConditionOperator]: {
      value: number;
      operand: number;
      expected: boolean;
    }[];
  } = {
    equals: [
      {
        value: 0,
        operand: 0,
        expected: true,
      },
      {
        value: 0,
        operand: 100,
        expected: false,
      },
      {
        value: 2,
        operand: 2,
        expected: true,
      },
      {
        value: 2,
        operand: 0,
        expected: false,
      },
      {
        value: -11.45,
        operand: -11.45,
        expected: true,
      },
      {
        value: -11.45,
        operand: 32,
        expected: false,
      },
      {
        value: 42.556,
        operand: 42.556,
        expected: true,
      },
      {
        value: 42.556,
        operand: 42.5566678,
        expected: false,
      },
    ],
    doesNotEqual: [
      {
        value: 0,
        operand: 0,
        expected: false,
      },
      {
        value: 0,
        operand: 100,
        expected: true,
      },
      {
        value: 2,
        operand: 2,
        expected: false,
      },
      {
        value: 2,
        operand: 0,
        expected: true,
      },
      {
        value: -11.45,
        operand: -11.45,
        expected: false,
      },
      {
        value: -11.45,
        operand: 32,
        expected: true,
      },
      {
        value: 42.556,
        operand: 42.556,
        expected: false,
      },
      {
        value: 42.556,
        operand: 42.5566678,
        expected: true,
      },
    ],
    isLessThan: [
      { value: 0, operand: 10, expected: true },
      { value: 0, operand: 0.0001, expected: true },
      { value: 0, operand: 0, expected: false },
      { value: 0, operand: -5, expected: false },
      { value: -10, operand: -4, expected: true },
      { value: -10, operand: -9.45, expected: true },
      { value: -10, operand: -10, expected: false },
      { value: -10, operand: -20, expected: false },
      { value: 22, operand: 24, expected: true },
      { value: 22, operand: 22.00022, expected: true },
      { value: 22, operand: 22, expected: false },
      { value: 22, operand: 21.999, expected: false },
    ],
    isLessThanEquals: [
      { value: 0, operand: 10, expected: true },
      { value: 0, operand: 0.0001, expected: true },
      { value: 0, operand: 0, expected: true },
      { value: 0, operand: -5, expected: false },

      { value: -10, operand: -4, expected: true },
      { value: -10, operand: -9.45, expected: true },
      { value: -10, operand: -10, expected: true },
      { value: -10, operand: -20, expected: false },

      { value: 22, operand: 24, expected: true },
      { value: 22, operand: 22.00022, expected: true },
      { value: 22, operand: 22, expected: true },
      { value: 22, operand: 21.999, expected: false },
    ],
    isGreaterThan: [
      { value: 0, operand: 10, expected: false },
      { value: 0, operand: 0.0001, expected: false },
      { value: 0, operand: 0, expected: false },
      { value: 0, operand: -0.00123, expected: true },
      { value: 0, operand: -5, expected: true },

      { value: -10, operand: -4, expected: false },
      { value: -10, operand: -9.45, expected: false },
      { value: -10, operand: -10, expected: false },
      { value: -10, operand: -10.3, expected: true },
      { value: -10, operand: -20, expected: true },

      { value: 22, operand: 24, expected: false },
      { value: 22, operand: 22.00022, expected: false },
      { value: 22, operand: 22, expected: false },
      { value: 22, operand: 21.999, expected: true },
      { value: 22, operand: 11, expected: true },
    ],
    isGreaterThanEquals: [
      { value: 0, operand: 10, expected: false },
      { value: 0, operand: 0.0001, expected: false },
      { value: 0, operand: 0, expected: true },
      { value: 0, operand: -0.00123, expected: true },
      { value: 0, operand: -5, expected: true },

      { value: -10, operand: -4, expected: false },
      { value: -10, operand: -9.45, expected: false },
      { value: -10, operand: -10, expected: true },
      { value: -10, operand: -10.3, expected: true },
      { value: -10, operand: -20, expected: true },

      { value: 22, operand: 24, expected: false },
      { value: 22, operand: 22.00022, expected: false },
      { value: 22, operand: 22, expected: true },
      { value: 22, operand: 21.999, expected: true },
      { value: 22, operand: 11, expected: true },
    ],
    isEven: [
      { value: 0, operand: 0, expected: true },
      { value: 1, operand: 0, expected: false },

      { value: 4, operand: 0, expected: true },
      { value: 5, operand: 0, expected: false },

      // Operands should not have any effect
      { value: 4, operand: 33, expected: true },
      { value: 5, operand: 33, expected: false },

      { value: 400, operand: 0, expected: true },
      { value: 501, operand: 0, expected: false },

      { value: -6606, operand: 0, expected: true },
      { value: -10001, operand: 0, expected: false },

      { value: 2.45, operand: 0, expected: false },
      { value: 3.45, operand: 0, expected: false },
    ],
    isOdd: [
      { value: 0, operand: 0, expected: false },
      { value: 1, operand: 0, expected: true },

      { value: 4, operand: 0, expected: false },
      { value: 5, operand: 0, expected: true },

      // Operands should not have any effect
      { value: 4, operand: 33, expected: false },
      { value: 5, operand: 33, expected: true },

      { value: 400, operand: 0, expected: false },
      { value: 501, operand: 0, expected: true },

      { value: -6606, operand: 0, expected: false },
      { value: -10001, operand: 0, expected: true },

      { value: 2.45, operand: 0, expected: false },
      { value: 3.45, operand: 0, expected: false },
    ],
  };

  for (const [operator, operatorTestCases] of Object.entries(testCases)) {
    describe(`Operator ${operator}`, () => {
      for (const { expected, value, operand } of operatorTestCases) {
        test(`Returns ${expected} for value = ${JSON.stringify(value)} and operand = ${JSON.stringify(operand)}`, () => {
          expect(
            evaluateNumberValueOperatorAndOperand(
              value,
              operator as NumberConditionOperator,
              operand,
            ),
          ).toBe(expected);
        });
      }
    });
  }
});
