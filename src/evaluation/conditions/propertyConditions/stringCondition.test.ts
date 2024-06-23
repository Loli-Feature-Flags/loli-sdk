import { describe } from "@jest/globals";

import type { PropertyConditionOperatorTestCases } from "../../../../test-utils/evaluation/propertyConditions";
import {
  createTestCasesByOperandsQuantifier,
  executePropertyConditionTests,
} from "../../../../test-utils/evaluation/propertyConditions";
import type { Quantifier } from "../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../schema/conditions/Quantifier";
import type { StringCondition } from "../../../schema/conditions/StringCondition";
import { StringConditionOperators } from "../../../schema/conditions/StringCondition";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateStringValueOperatorAndOperand } from "./base/values/string";
import { evaluateStringCondition } from "./stringCondition";

describe("evaluateStringCondition", () => {
  executePropertyConditionTests<StringCondition, string>({
    evaluateCondition: evaluateStringCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "string",
        propertyId,
        operator: "isNotBlank",
        operands: [],
        operandsQuantifier: "some",
      }),
      property: {
        id: "a75sda687s5d",
        name: "E-Mail",
        path: ["email"],
        type: "string",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectDataTypeInSpec: {
        id: "876as5d8a5sd",
        name: "Age",
        path: ["age"],
        type: "number",
        rolloutDiscriminator: true,
      },
      propertyMissingInEvaluationContext: {
        id: "a9s8d6a867sd5asd",
        name: "Missing ID",
        path: ["missingId"],
        type: "string",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "a76sdta8bs67d5at876ds",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "string",
        rolloutDiscriminator: true,
      },
      evaluationContext: {
        email: "test@acme.com",
        wrongDataType: 42,
        age: 26,
      },
    },
    operatorTests: {
      property: {
        type: "string",
        path: ["email"],
        name: "E-Mail",
        id: "7a5sd7a56sdasd87a65sd",
        rolloutDiscriminator: true,
      },
      createCondition: ({ operator, operandsQuantifier, operands }) => ({
        type: "string",
        propertyId: "7a5sd7a56sdasd87a65sd",
        operator,
        operandsQuantifier,
        operands,
      }),
      createEvaluationContext: (value) => ({
        email: value,
      }),
      // We are generating test cases based on pre-evaluating value/operands variants.
      // We want to cross-test evaluateStringCondition and make sure it does the following:
      //  - uses evaluateWithOperandsQuantifier
      //  - uses evaluateStringValueOperatorAndOperand
      cases: (function () {
        const constructedCases: Record<
          string,
          ReturnType<
            typeof createTestCasesByOperandsQuantifier<StringCondition, string>
          >
        > = {};

        const valueOperandsVariants: { value: string; operands: string[] }[] = [
          {
            value: "foo@acme.com",
            operands: [],
          },
          {
            value: "foo@acme.com",
            operands: ["bar@acme.com"],
          },
          {
            value: "foo@acme.com",
            operands: ["foo@acme.com"],
          },
          {
            value: "bar@acme.com",
            operands: ["foo@acme.com", "bar@acme.com"],
          },
          {
            value: "hello@acme.com",
            operands: ["foo@acme.com", "bar@acme.com"],
          },
          {
            value: "foo@acme.com",
            operands: ["foo@acme.com", "foo@acme.com"],
          },
          {
            value: "hello@acme.com",
            operands: ["foo@acme.com", "foo@acme.com"],
          },
        ];

        for (const operator of StringConditionOperators) {
          const quantifierCases: Record<
            string,
            ({ expected: boolean } & (typeof valueOperandsVariants)[number])[]
          > = {};

          for (const quantifier of Quantifiers) {
            quantifierCases[quantifier] = [];

            for (const { value, operands } of valueOperandsVariants) {
              quantifierCases[quantifier].push({
                expected: evaluateWithOperandsQuantifier<StringCondition>(
                  {
                    operator,
                    operands,
                    operandsQuantifier: quantifier,
                    type: "string",
                    propertyId: "emailId",
                  },
                  (operand) => {
                    return evaluateStringValueOperatorAndOperand(
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
          StringCondition,
          string
        >;
      })(),
    },
  });
});
