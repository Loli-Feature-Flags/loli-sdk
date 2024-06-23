import { describe, expect, test } from "@jest/globals";

import type { BooleanCondition } from "../schema/conditions/BooleanCondition";
import type { Condition } from "../schema/conditions/Condition";
import type {
  ConditionSet,
  ConditionSetOperator,
} from "../schema/conditionSet/ConditionSet";
import { ConditionSetOperators } from "../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Property } from "../schema/Property";
import { evaluateConditionSet } from "./conditionSet";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";

describe("evaluateConditionSet", () => {
  const trueProperty: Property = {
    type: "boolean",
    path: ["true"],
    name: "True",
    rolloutDiscriminator: false,
    id: "truePropertyId",
  };

  const falseProperty: Property = {
    type: "boolean",
    path: ["false"],
    name: "False",
    rolloutDiscriminator: false,
    id: "falsePropertyId",
  };

  const loliSpec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [],
    segments: [],
    evaluationContext: {
      properties: [trueProperty, falseProperty],
    },
  };

  const evaluationContext: EvaluationContext = {
    [trueProperty.path[0]]: true,
    [falseProperty.path[1]]: false,
  };

  const evaluationMetadata: EvaluationMetadata = {
    evaluationDateTime: new Date(),
    rolloutGroup: 0,
  };

  const truePropertyCondition: BooleanCondition = {
    type: "boolean",
    propertyId: trueProperty.id,
    operator: "isTrue",
  };

  const falsePropertyCondition: BooleanCondition = {
    type: "boolean",
    propertyId: falseProperty.id,
    operator: "isTrue",
  };

  const testCases: {
    [key in ConditionSetOperator]: {
      conditions: Condition[];
      expected: boolean;
    }[];
  } = {
    and: [
      { conditions: [], expected: false },
      { conditions: [falsePropertyCondition], expected: false },
      { conditions: [truePropertyCondition], expected: true },
      {
        conditions: [falsePropertyCondition, falsePropertyCondition],
        expected: false,
      },
      {
        conditions: [falsePropertyCondition, truePropertyCondition],
        expected: false,
      },
      {
        conditions: [truePropertyCondition, truePropertyCondition],
        expected: true,
      },
    ],
    or: [
      { conditions: [], expected: false },
      { conditions: [falsePropertyCondition], expected: false },
      { conditions: [truePropertyCondition], expected: true },
      {
        conditions: [falsePropertyCondition, falsePropertyCondition],
        expected: false,
      },
      {
        conditions: [falsePropertyCondition, truePropertyCondition],
        expected: true,
      },
      {
        conditions: [truePropertyCondition, truePropertyCondition],
        expected: true,
      },
    ],
    nand: [
      { conditions: [], expected: false },
      { conditions: [falsePropertyCondition], expected: true },
      { conditions: [truePropertyCondition], expected: false },
      {
        conditions: [falsePropertyCondition, falsePropertyCondition],
        expected: true,
      },
      {
        conditions: [falsePropertyCondition, truePropertyCondition],
        expected: true,
      },
      {
        conditions: [truePropertyCondition, truePropertyCondition],
        expected: false,
      },
    ],
    nor: [
      { conditions: [], expected: false },
      { conditions: [falsePropertyCondition], expected: true },
      { conditions: [truePropertyCondition], expected: false },
      {
        conditions: [falsePropertyCondition, falsePropertyCondition],
        expected: true,
      },
      {
        conditions: [falsePropertyCondition, truePropertyCondition],
        expected: false,
      },
      {
        conditions: [truePropertyCondition, truePropertyCondition],
        expected: false,
      },
    ],
  };

  for (const operator of ConditionSetOperators) {
    describe(`Operator = ${operator}`, () => {
      for (const { conditions, expected } of testCases[operator]) {
        test(`Returns ${expected} for conditions = ${JSON.stringify(conditions)}`, () => {
          const conditionSet: ConditionSet = {
            conditions,
            operator,
          };

          expect(
            evaluateConditionSet(
              conditionSet,
              loliSpec,
              evaluationContext,
              evaluationMetadata,
            ),
          ).toBe(expected);
        });
      }
    });
  }
});
