import { describe } from "@jest/globals";

import { executePropertyConditionTests } from "../../../../test-utils/evaluation/propertyConditions";
import type { BooleanCondition } from "../../../schema/conditions/BooleanCondition";
import { evaluateBooleanCondition } from "./booleanCondition";

describe("evaluateBooleanCondition", () => {
  executePropertyConditionTests<BooleanCondition, boolean>({
    evaluateCondition: evaluateBooleanCondition,
    strictFalseTests: {
      createCondition: (propertyId) => ({
        type: "boolean",
        propertyId,
        operator: "isTrue",
      }),
      property: {
        id: "u7asrd56",
        name: "Admin Flag",
        path: ["isAdmin"],
        type: "boolean",
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
        id: "879asd565a4s",
        name: "Missing Flag",
        path: ["missingFlag"],
        type: "boolean",
        rolloutDiscriminator: true,
      },
      propertyWithIncorrectEvaluationContextValueDataType: {
        id: "asd879a6sd",
        name: "Wrong Evaluation Context Data Type",
        path: ["wrongDataType"],
        type: "boolean",
        rolloutDiscriminator: true,
      },
      evaluationContext: {
        isAdmin: true,
        wrongDataType: 42,
        email: "test@acme.com",
      },
    },
    operatorTests: {
      property: {
        type: "boolean",
        path: ["isAdmin"],
        name: "Is Admin Flag",
        id: "as8d6ta8rv7s6dr5",
        rolloutDiscriminator: true,
      },
      createCondition: ({ operator }) => ({
        type: "boolean",
        propertyId: "as8d6ta8rv7s6dr5",
        operator,
      }),
      createEvaluationContext: (value) => ({
        isAdmin: value,
      }),
      cases: {
        isTrue: [
          { expected: true, value: true },
          { expected: false, value: false },
        ],
        isFalse: [
          { expected: true, value: false },
          { expected: false, value: true },
        ],
      },
    },
  });
});
