import { describe } from "@jest/globals";

import type { PropertyConditionOperatorTestCases } from "../../../../test-utils/evaluation/propertyConditions";
import {
  createTestCasesByPropertyArrayAndOperandsQuantifiers,
  executePropertyConditionTests,
} from "../../../../test-utils/evaluation/propertyConditions";
import type { Quantifier } from "../../../schema/conditions/Quantifier";
import { Quantifiers } from "../../../schema/conditions/Quantifier";
import type { StringArrayCondition } from "../../../schema/conditions/StringArrayCondition";
import { StringArrayConditionOperators } from "../../../schema/conditions/StringArrayCondition";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateForArrayProperties } from "./base/quantifiers/propertyArray";
import { evaluateStringValueOperatorAndOperand } from "./base/values/string";
import { evaluateStringArrayCondition } from "./stringArrayCondition";

describe("evaluateStringArrayCondition", () => {
  executePropertyConditionTests<StringArrayCondition, string[]>({
    evaluateCondition: evaluateStringArrayCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "stringArray",
        propertyId,
        propertyArrayQuantifier: "some",
        operator: "isNotBlank",
        operands: [],
        operandsQuantifier: "some",
      }),
      property: {
        id: "876asd876as5dasdas",
        name: "Secondary E-Mail Addresses",
        path: ["secondaryEmails"],
        type: "stringArray",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectDataTypeInSpec: {
        id: "76a9s6d8as7d987a6sd",
        name: "Age",
        path: ["age"],
        type: "number",
        rolloutDiscriminator: true,
      },
      propertyMissingInEvaluationContext: {
        id: "876h32985a8s7d65a8sd",
        name: "Missing ID",
        path: ["missingId"],
        type: "string",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "ouasd0987as968d6a8s5d",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "string",
        rolloutDiscriminator: true,
      },
      evaluationContext: {
        secondaryEmails: ["test+2@acme.com", "test+42@acme.com"],
        wrongDataType: 42,
        age: 26,
      },
    },
    operatorTests: {
      property: {
        id: "876asd876as5dasdas",
        name: "Secondary E-Mail Addresses",
        path: ["secondaryEmails"],
        type: "stringArray",
        rolloutDiscriminator: true,
      },
      createCondition: ({
        propertyArrayQuantifier,
        operator,
        operandsQuantifier,
        operands,
      }) => ({
        type: "stringArray",
        propertyId: "876asd876as5dasdas",
        propertyArrayQuantifier,
        operator,
        operandsQuantifier,
        operands,
      }),
      createEvaluationContext: (value) => ({
        secondaryEmails: value,
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
              StringArrayCondition,
              string[]
            >
          >
        > = {};

        const valueOperandsVariants: { value: string[]; operands: string[] }[] =
          [
            { value: [], operands: ["hey@acme.com"] },
            {
              value: ["foo@acme.com"],
              operands: [],
            },
            {
              value: ["test@acme.com", "foo@acme.com"],
              operands: ["foo@acme.com", "abcdef@acme.com"],
            },
            {
              value: ["hello@acme.com", "abc@acme.com"],
              operands: ["foo@acme.com", "bar@acme.com"],
            },
            {
              value: ["foo@acme.com", "bar@acme.com"],
              operands: ["foo@acme.com", "bar@acme.com"],
            },
          ];

        for (const operator of StringArrayConditionOperators) {
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
                const condition: StringArrayCondition = {
                  operator,
                  operands,
                  propertyArrayQuantifier,
                  operandsQuantifier,
                  type: "stringArray",
                  propertyId: "876asd876as5dasdas",
                };

                operandQuantifierCases[operandsQuantifier].push({
                  expected: evaluateForArrayProperties(
                    condition,
                    value,
                    (value, operator) => {
                      return evaluateWithOperandsQuantifier<StringArrayCondition>(
                        condition,
                        (operand) => {
                          return evaluateStringValueOperatorAndOperand(
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
          StringArrayCondition,
          string[]
        >;
      })(),
    },
  });
});
