import { describe } from "@jest/globals";

import type { PropertyConditionOperatorTestCases } from "../../../../test-utils/evaluation/propertyConditions";
import {
  createTestCasesByOperandsQuantifier,
  executePropertyConditionTests,
} from "../../../../test-utils/evaluation/propertyConditions";
import type { NumberCondition } from "../../../schema/conditions/NumberCondition";
import { NumberConditionOperators } from "../../../schema/conditions/NumberCondition";
import type { Quantifier } from "../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../schema/conditions/Quantifier";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateNumberValueOperatorAndOperand } from "./base/values/number";
import { evaluateNumberCondition } from "./numberCondition";

describe("evaluateNumberCondition", () => {
  executePropertyConditionTests<NumberCondition, number>({
    evaluateCondition: evaluateNumberCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "number",
        propertyId,
        operator: "equals",
        operands: [],
        operandsQuantifier: "some",
      }),
      property: {
        id: "6a7std86a7sdh5a86sdt",
        name: "age",
        path: ["age"],
        type: "number",
        rolloutDiscriminator: false,
      },
      propertyWithIncorrectDataTypeInSpec: {
        id: "98a7sdh9asd",
        name: "E-Mail",
        path: ["email"],
        type: "string",
        rolloutDiscriminator: true,
      },
      propertyMissingInEvaluationContext: {
        id: "87as56d8a76s5dg",
        name: "Missing Number",
        path: ["missingNumber"],
        type: "number",
        rolloutDiscriminator: false,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "8a7s6dh98a76sd",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "number",
        rolloutDiscriminator: false,
      },
      evaluationContext: {
        age: 42,
        email: "test@acme.com",
        wrongDataType: true,
      },
    },
    operatorTests: {
      property: {
        type: "number",
        path: ["age"],
        name: "Age",
        id: "98a7s6d9a87s6d87asd",
        rolloutDiscriminator: false,
      },
      createCondition: ({ operator, operandsQuantifier, operands }) => ({
        type: "number",
        propertyId: "98a7s6d9a87s6d87asd",
        operator,
        operandsQuantifier,
        operands,
      }),
      createEvaluationContext: (value) => ({
        age: value,
      }),
      // We are generating test cases based on pre-evaluating value/operands variants.
      // We want to cross-test evaluateNumberCondition and make sure it does the following:
      //  - uses evaluateWithOperandsQuantifier
      //  - uses evaluateNumberValueOperatorAndOperand
      cases: (function () {
        const constructedCases: Record<
          string,
          ReturnType<
            typeof createTestCasesByOperandsQuantifier<NumberCondition, number>
          >
        > = {};

        const valueOperandsVariants: { value: number; operands: number[] }[] = [
          {
            value: 2,
            operands: [],
          },
          {
            value: -3,
            operands: [],
          },
          {
            value: 2,
            operands: [2],
          },
          {
            value: -3,
            operands: [2],
          },
          {
            value: 6,
            operands: [2],
          },
          {
            value: 0,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
          {
            value: -3,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
          {
            value: 2,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
          {
            value: 4,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },

          {
            value: -6,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
          {
            value: 6,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
          {
            value: 9,
            operands: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
          },
        ];

        for (const operator of NumberConditionOperators) {
          const quantifierCases: Record<
            string,
            ({ expected: boolean } & (typeof valueOperandsVariants)[number])[]
          > = {};

          for (const quantifier of Quantifiers) {
            quantifierCases[quantifier] = [];

            for (const { value, operands } of valueOperandsVariants) {
              quantifierCases[quantifier].push({
                expected: evaluateWithOperandsQuantifier<NumberCondition>(
                  {
                    operator,
                    operands,
                    operandsQuantifier: quantifier,
                    type: "number",
                    propertyId: "98a7s6d9a87s6d87asd",
                  },
                  (operand) => {
                    return evaluateNumberValueOperatorAndOperand(
                      value,
                      operator,
                      operand,
                    );
                  },
                ),
                value: value,
                operands: operands,
              });
            }
          }

          constructedCases[operator] = createTestCasesByOperandsQuantifier(
            quantifierCases as Record<
              Quantifier,
              ({ expected: boolean } & (typeof valueOperandsVariants)[number])[]
            >,
          );
        }

        return constructedCases as PropertyConditionOperatorTestCases<
          NumberCondition,
          number
        >;
      })(),
    },
  });
});
