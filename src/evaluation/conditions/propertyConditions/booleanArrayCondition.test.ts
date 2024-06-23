import { describe } from "@jest/globals";

import type { PropertyConditionOperatorTestCases } from "../../../../test-utils/evaluation/propertyConditions";
import {
  createTestCasesByPropertyArrayQuantifier,
  executePropertyConditionTests,
} from "../../../../test-utils/evaluation/propertyConditions";
import type { BooleanArrayCondition } from "../../../schema/conditions/BooleanArrayCondition";
import { BooleanArrayConditionOperators } from "../../../schema/conditions/BooleanArrayCondition";
import type { Quantifier } from "../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../schema/conditions/Quantifier";
import { evaluateForArrayProperties } from "./base/quantifiers/propertyArray";
import { evaluateBooleanValueAndOperator } from "./base/values/boolean";
import { evaluateBooleanArrayCondition } from "./booleanArrayCondition";

describe("evaluateBooleanArrayCondition", () => {
  executePropertyConditionTests<BooleanArrayCondition, boolean[]>({
    evaluateCondition: evaluateBooleanArrayCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "booleanArray",
        propertyId,
        operator: "isTrue",
        propertyArrayQuantifier: "some",
      }),
      property: {
        id: "87a5s4d76",
        name: "Flag Array",
        path: ["flagArray"],
        type: "booleanArray",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectDataTypeInSpec: {
        id: "9807sda",
        name: "E-Mail",
        path: ["email"],
        type: "string",
        rolloutDiscriminator: true,
      },
      propertyMissingInEvaluationContext: {
        id: "6875asd7546a",
        name: "Missing Flag Array",
        path: ["missingFlagArray"],
        type: "booleanArray",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "asd879a6sd",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "booleanArray",
        rolloutDiscriminator: true,
      },
      evaluationContext: {
        flagArray: [true, true, false],
        wrongDataType: [1, 2, 3, 4],
        email: "test@acme.com",
      },
    },
    operatorTests: {
      property: {
        type: "booleanArray",
        path: ["flagArray"],
        name: "Flag Array",
        id: "786as5d756a4sd",
        rolloutDiscriminator: true,
      },
      createCondition: ({ operator, propertyArrayQuantifier }) => ({
        type: "booleanArray",
        propertyId: "786as5d756a4sd",
        operator,
        propertyArrayQuantifier: propertyArrayQuantifier,
      }),
      createEvaluationContext: (value) => ({
        flagArray: value,
      }),
      // We are generating test cases based on pre-evaluating value/operands variants.
      // We want to cross-test evaluateBooleanArrayCondition and make sure it does the following:
      //  - uses evaluateForArrayProperties
      //  - uses evaluateBooleanValueAndOperator
      cases: (function () {
        const constructedCases: Record<
          string,
          ReturnType<
            typeof createTestCasesByPropertyArrayQuantifier<
              BooleanArrayCondition,
              boolean[]
            >
          >
        > = {};

        const valueVariants: { value: boolean[] }[] = [
          { value: [] },
          { value: [true] },
          { value: [false] },
          { value: [false, true] },
        ];

        for (const operator of BooleanArrayConditionOperators) {
          const quantifierCases: Record<
            string,
            ({ expected: boolean } & (typeof valueVariants)[number])[]
          > = {};

          for (const propertyArrayQuantifier of Quantifiers) {
            quantifierCases[propertyArrayQuantifier] = [];

            for (const { value } of valueVariants) {
              quantifierCases[propertyArrayQuantifier].push({
                expected: evaluateForArrayProperties<BooleanArrayCondition>(
                  {
                    operator,
                    propertyArrayQuantifier,
                    type: "booleanArray",
                    propertyId: "786as5d756a4sd",
                  },
                  value,
                  (arrayElement, nonArrayOperator) => {
                    return evaluateBooleanValueAndOperator(
                      arrayElement,
                      nonArrayOperator,
                    );
                  },
                ),
                value: value,
              });
            }
          }

          constructedCases[operator] = createTestCasesByPropertyArrayQuantifier(
            quantifierCases as Record<
              Quantifier,
              ({ expected: boolean } & (typeof valueVariants)[number])[]
            >,
          );
        }

        return constructedCases as PropertyConditionOperatorTestCases<
          BooleanArrayCondition,
          boolean[]
        >;
      })(),
    },
  });
});
