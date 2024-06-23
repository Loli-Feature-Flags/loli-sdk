import { describe } from "@jest/globals";

import type { PropertyConditionOperatorTestCases } from "../../../../test-utils/evaluation/propertyConditions";
import {
  createTestCasesByPropertyArrayAndOperandsQuantifiers,
  executePropertyConditionTests,
} from "../../../../test-utils/evaluation/propertyConditions";
import type { NumberArrayCondition } from "../../../schema/conditions/NumberArrayCondition";
import { NumberArrayConditionOperators } from "../../../schema/conditions/NumberArrayCondition";
import type { Quantifier } from "../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../schema/conditions/Quantifier";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateForArrayProperties } from "./base/quantifiers/propertyArray";
import { evaluateNumberValueOperatorAndOperand } from "./base/values/number";
import { evaluateNumberArrayCondition } from "./numberArrayCondition";

describe("evaluateNumberArrayCondition", () => {
  executePropertyConditionTests<NumberArrayCondition, number[]>({
    evaluateCondition: evaluateNumberArrayCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "numberArray",
        propertyId,
        propertyArrayQuantifier: "some",
        operator: "equals",
        operands: [],
        operandsQuantifier: "some",
      }),
      property: {
        id: "0a87sd987asd",
        name: "Supported Versions",
        path: ["supportedVersions"],
        type: "numberArray",
        rolloutDiscriminator: false,
      },
      propertyWithIncorrectDataTypeInSpec: {
        id: "i8a7s6d876a5sd",
        name: "Age",
        path: ["age"],
        type: "number",
        rolloutDiscriminator: false,
      },
      propertyMissingInEvaluationContext: {
        id: "lk3h45o7zo9z8w978e",
        name: "Missing Versions",
        path: ["missingVersions"],
        type: "numberArray",
        rolloutDiscriminator: false,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "i8as6da87s65d8asd",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "numberArray",
        rolloutDiscriminator: false,
      },
      evaluationContext: {
        supportedVersions: [1, 2, 3, 4],
        age: 26,
        wrongDataType: [true],
      },
    },
    operatorTests: {
      property: {
        id: "98as76d987as6d8796as",
        name: "supportedVersions",
        path: ["supportedVersions"],
        type: "numberArray",
        rolloutDiscriminator: false,
      },
      createCondition: ({
        propertyArrayQuantifier,
        operator,
        operandsQuantifier,
        operands,
      }) => ({
        type: "numberArray",
        propertyId: "98as76d987as6d8796as",
        propertyArrayQuantifier,
        operator,
        operandsQuantifier,
        operands,
      }),
      createEvaluationContext: (value) => ({
        supportedVersions: value,
      }),
      // We are generating test cases based on pre-evaluating value/operands variants.
      // We want to cross-test evaluateStringArrayCondition and make sure it does the following:
      //  - uses evaluateForArrayProperties
      //  - uses evaluateWithOperandsQuantifier
      //  - uses evaluateStringValueOperatorAndOperand
      cases: (function () {
        const constructedCases: Record<
          string,
          ReturnType<
            typeof createTestCasesByPropertyArrayAndOperandsQuantifiers<
              NumberArrayCondition,
              number[]
            >
          >
        > = {};

        const valueOperandsVariants: { value: number[]; operands: number[] }[] =
          [
            { value: [], operands: [] },
            { value: [], operands: [22] },
            { value: [11], operands: [] },
            { value: [11], operands: [22] },
            { value: [11, 12, 762], operands: [] },
            { value: [11, 12, 762], operands: [-23, 123, 2] },
            { value: [11, 12, 762], operands: [1000, 1101223] },
            { value: [11, 12, 762], operands: [-2535, -235234] },
            { value: [11, 22, 33], operands: [22, 33, 44] },
          ];

        for (const operator of NumberArrayConditionOperators) {
          const propertyArrayQuantifierCases: Record<
            string,
            Record<
              string,
              ({ expected: boolean } & (typeof valueOperandsVariants)[number])[]
            >
          > = {};

          for (const propertyArrayQuantifier of Quantifiers) {
            const operandQuantifierCases: Record<
              string,
              ({ expected: boolean } & (typeof valueOperandsVariants)[number])[]
            > = {};

            for (const operandsQuantifier of Quantifiers) {
              operandQuantifierCases[operandsQuantifier] = [];

              for (const { value, operands } of valueOperandsVariants) {
                const condition: NumberArrayCondition = {
                  operator,
                  operands,
                  propertyArrayQuantifier,
                  operandsQuantifier,
                  type: "numberArray",
                  propertyId: "98as76d987as6d8796as",
                };

                operandQuantifierCases[operandsQuantifier].push({
                  expected: evaluateForArrayProperties(
                    condition,
                    value,
                    (value, operator) => {
                      return evaluateWithOperandsQuantifier<NumberArrayCondition>(
                        condition,
                        (operand) => {
                          return evaluateNumberValueOperatorAndOperand(
                            value,
                            operator,
                            operand,
                          );
                        },
                      );
                    },
                  ),

                  value: value,
                  operands: operands,
                });
              }
            }

            propertyArrayQuantifierCases[propertyArrayQuantifier] =
              operandQuantifierCases;
          }

          constructedCases[operator] =
            createTestCasesByPropertyArrayAndOperandsQuantifiers(
              propertyArrayQuantifierCases as Record<
                Quantifier,
                Record<
                  Quantifier,
                  ({
                    expected: boolean;
                  } & (typeof valueOperandsVariants)[number])[]
                >
              >,
            );
        }

        return constructedCases as PropertyConditionOperatorTestCases<
          NumberArrayCondition,
          number[]
        >;
      })(),
    },
  });
});
