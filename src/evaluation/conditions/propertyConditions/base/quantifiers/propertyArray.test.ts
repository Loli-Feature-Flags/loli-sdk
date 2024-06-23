import { describe, expect, test } from "@jest/globals";

import type { BooleanArrayCondition } from "../../../../../schema/conditions/BooleanArrayCondition";
import type { Quantifier } from "../../../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../../../schema/conditions/Quantifier";
import { evaluateForArrayProperties } from "./propertyArray";

describe("evaluateWithPropertyArrayQuantifier", () => {
  describe("Operator = hasElements", () => {
    test("Returns false for empty array", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasElements",
        propertyId: "any",
      };

      expect(evaluateForArrayProperties(condition, [], () => true)).toBe(false);
    });

    test("Returns true for array with one element", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasElements",
        propertyId: "any",
      };

      expect(evaluateForArrayProperties(condition, [false], () => true)).toBe(
        true,
      );
    });

    test("Returns true for array with multiple elements", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasElements",
        propertyId: "any",
      };

      expect(
        evaluateForArrayProperties(condition, [true, false, false], () => true),
      ).toBe(true);
    });
  });

  describe("Operator = hasNoElements", () => {
    test("Returns true for empty array", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasNoElements",
        propertyId: "any",
      };

      expect(evaluateForArrayProperties(condition, [], () => true)).toBe(true);
    });

    test("Returns false for array with one element", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasNoElements",
        propertyId: "any",
      };

      expect(evaluateForArrayProperties(condition, [false], () => true)).toBe(
        false,
      );
    });

    test("Returns false for array with multiple elements", () => {
      const condition: BooleanArrayCondition = {
        type: "booleanArray",
        propertyArrayQuantifier: "some",
        operator: "hasNoElements",
        propertyId: "any",
      };

      expect(
        evaluateForArrayProperties(condition, [true, false, false], () => true),
      ).toBe(false);
    });
  });

  describe("No array size check operator cases", () => {
    const testCases: {
      [key in Quantifier]: { values: boolean[]; expected: boolean }[];
    } = {
      some: [
        { values: [], expected: false },
        { values: [false], expected: false },
        { values: [true], expected: true },
        { values: [false, false], expected: false },
        { values: [false, true], expected: true },
        { values: [true, true], expected: true },
      ],
      every: [
        { values: [], expected: false },
        { values: [false], expected: false },
        { values: [true], expected: true },
        { values: [false, false], expected: false },
        { values: [false, true], expected: false },
        { values: [true, true], expected: true },
      ],
      notAny: [
        { values: [], expected: false },
        { values: [false], expected: true },
        { values: [true], expected: false },
        { values: [false, false], expected: true },
        { values: [false, true], expected: false },
        { values: [true, true], expected: false },
      ],
      notEvery: [
        { values: [], expected: false },
        { values: [false], expected: true },
        { values: [true], expected: false },
        { values: [false, false], expected: true },
        { values: [false, true], expected: true },
        { values: [true, true], expected: false },
      ],
    };

    for (const quantifier of Quantifiers) {
      describe(`Quantifier = ${quantifier}`, () => {
        for (const { expected, values } of testCases[quantifier]) {
          test(`Returns ${expected} for values array = ${JSON.stringify(values)}`, () => {
            const condition: BooleanArrayCondition = {
              type: "booleanArray",
              propertyArrayQuantifier: quantifier,
              operator: "isTrue",
              propertyId: "any",
            };

            expect(
              evaluateForArrayProperties(
                condition,
                values,
                (value) => value === true,
              ),
            ).toBe(expected);
          });
        }
      });
    }
  });
});
