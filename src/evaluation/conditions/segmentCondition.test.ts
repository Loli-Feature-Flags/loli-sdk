import { describe, expect, test } from "@jest/globals";

import type { BooleanCondition } from "../../schema/conditions/BooleanCondition";
import type {
  SegmentCondition,
  SegmentConditionsOperator,
} from "../../schema/conditions/SegmentCondition";
import { SegmentConditionsOperators } from "../../schema/conditions/SegmentCondition";
import type { LoliSpec } from "../../schema/LoliSpec";
import type { Property } from "../../schema/Property";
import type { EvaluationContext } from "../EvaluationContext";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { evaluateSegmentCondition } from "./segmentCondition";

describe("evaluateSegmentCondition", () => {
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

  const loliSpec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [],
    segments: [
      {
        id: "trueSegmentId",
        name: "True Segment",
        conditionSet: {
          operator: "and",
          conditions: [truePropertyCondition],
        },
      },
      {
        id: "falseSegmentId",
        name: "False Segment",
        conditionSet: {
          operator: "and",
          conditions: [truePropertyCondition, falsePropertyCondition],
        },
      },
    ],
    evaluationContext: {
      properties: [trueProperty, falseProperty],
    },
  };

  const evaluationContext: EvaluationContext = {
    [trueProperty.path[0]]: true,
    [falseProperty.path[1]]: false,
  };

  const evaluationMetadata: EvaluationMetadata = {
    rolloutGroup: 0,
    evaluationDateTime: new Date(),
  };

  const testCases: {
    [key in SegmentConditionsOperator]: {
      segmentId: string;
      expected: boolean;
    }[];
  } = {
    isTrue: [
      { segmentId: "trueSegmentId", expected: true },
      { segmentId: "falseSegmentId", expected: false },
      { segmentId: "unknownSegmentThatWillNeverExistId", expected: false },
    ],
    isFalse: [
      { segmentId: "trueSegmentId", expected: false },
      { segmentId: "falseSegmentId", expected: true },
      { segmentId: "unknownSegmentThatWillNeverExistId", expected: false },
    ],
  };

  for (const operator of SegmentConditionsOperators) {
    describe(`Operator = ${operator}`, () => {
      for (const { expected, segmentId } of testCases[operator]) {
        test(`Returns ${expected} for segment with ID = ${segmentId}`, () => {
          const condition: SegmentCondition = {
            type: "segment",
            operator,
            segmentId,
          };

          expect(
            evaluateSegmentCondition(
              condition,
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
