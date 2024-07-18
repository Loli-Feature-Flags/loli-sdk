import { describe, expect, test } from "@jest/globals";

import type { BooleanCondition } from "../schema/conditions/BooleanCondition";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Property } from "../schema/Property";
import type { Segment } from "../schema/segment/Segment";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";
import { evaluateSegment } from "./segment";

describe("evaluateSegment", () => {
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

  test("Returns true for a conditionSet evaluating to true", () => {
    const segment: Segment = {
      id: "0a9s7dh9a87sd",
      name: "Some Segment",
      conditionSet: {
        operator: "and",
        conditions: [truePropertyCondition],
      },
    };

    expect(
      evaluateSegment(segment, loliSpec, evaluationContext, evaluationMetadata),
    ).toBe(true);
  });

  test("Returns false for a conditionSet evaluating to false", () => {
    const segment: Segment = {
      id: "987as6d896asd",
      name: "Some Segment",
      conditionSet: {
        operator: "and",
        conditions: [truePropertyCondition, falsePropertyCondition],
      },
    };

    expect(
      evaluateSegment(segment, loliSpec, evaluationContext, evaluationMetadata),
    ).toBe(false);
  });

  test("Stores evaluations in specified segmentEvaluationCache and uses cache correctly", () => {
    const segment: Segment = {
      id: "0a9s7dh9a87sd",
      name: "Some Segment",
      conditionSet: {
        operator: "and",
        conditions: [truePropertyCondition],
      },
    };

    const evaluationMetadataWithSegmentEvaluationCache: EvaluationMetadata = {
      ...evaluationMetadata,
      segmentEvaluationCache: new Map(),
    };

    expect(
      evaluateSegment(
        segment,
        loliSpec,
        evaluationContext,
        evaluationMetadataWithSegmentEvaluationCache,
      ),
    ).toBe(true);

    expect(
      evaluationMetadataWithSegmentEvaluationCache.segmentEvaluationCache?.get(
        segment.id,
      ),
    ).toBe(true);

    // now we manipulate the cached evaluation to "false", reevaluate and see if the cached value is returned instead

    evaluationMetadataWithSegmentEvaluationCache.segmentEvaluationCache?.set(
      segment.id,
      false,
    );

    expect(
      evaluateSegment(
        segment,
        loliSpec,
        evaluationContext,
        evaluationMetadataWithSegmentEvaluationCache,
      ),
    ).toBe(false); // cached value

    // Now we delete the cached evaluation -> evaluate call should return true again

    evaluationMetadataWithSegmentEvaluationCache.segmentEvaluationCache?.delete(
      segment.id,
    );

    expect(
      evaluateSegment(
        segment,
        loliSpec,
        evaluationContext,
        evaluationMetadataWithSegmentEvaluationCache,
      ),
    ).toBe(true);
  });
});
