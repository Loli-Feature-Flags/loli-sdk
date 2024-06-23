import { describe, expect, test } from "@jest/globals";

import type { BooleanArrayCondition } from "../../../schema/conditions/BooleanArrayCondition";
import type { BooleanCondition } from "../../../schema/conditions/BooleanCondition";
import type { NumberArrayCondition } from "../../../schema/conditions/NumberArrayCondition";
import type { NumberCondition } from "../../../schema/conditions/NumberCondition";
import type { StringArrayCondition } from "../../../schema/conditions/StringArrayCondition";
import type { StringCondition } from "../../../schema/conditions/StringCondition";
import type { LoliSpec } from "../../../schema/LoliSpec";
import type { EvaluationContext } from "../../EvaluationContext";
import type { EvaluationMetadata } from "../../EvaluationMetadata";
import { evaluatePropertyCondition } from "./propertyCondition";

describe("evaluatePropertyCondition", () => {
  const loliSpec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [],
    segments: [],
    evaluationContext: {
      properties: [
        {
          type: "booleanArray",
          id: "booleanArrayId",
          name: "Boolean Array",
          path: ["booleanArray"],
          rolloutDiscriminator: false,
        },
        {
          type: "boolean",
          id: "booleanId",
          name: "Boolean",
          path: ["boolean"],
          rolloutDiscriminator: false,
        },
        {
          type: "numberArray",
          id: "numberArrayId",
          name: "Number Array",
          path: ["numberArray"],
          rolloutDiscriminator: false,
        },
        {
          type: "number",
          id: "numberId",
          name: "Number",
          path: ["number"],
          rolloutDiscriminator: false,
        },
        {
          type: "stringArray",
          id: "stringArrayId",
          name: "String Array",
          path: ["stringArray"],
          rolloutDiscriminator: false,
        },
        {
          type: "string",
          id: "stringId",
          name: "String",
          path: ["string"],
          rolloutDiscriminator: false,
        },
      ],
    },
  };

  const evaluationContext: EvaluationContext = {
    booleanArray: [true, true, true],
    boolean: true,
    numberArray: [1, 2, 3, 4],
    number: 42,
    stringArray: ["foo@acme.com", "test@acme.com"],
    string: "bar@acme.com",
  };

  const evaluationMetadata: EvaluationMetadata = {
    evaluationDateTime: new Date(),
    rolloutGroup: 0,
  };

  test("Returns true for a boolean array condition and valid evaluation context value", () => {
    const condition: BooleanArrayCondition = {
      type: "booleanArray",
      operator: "isTrue",
      propertyId: "booleanArrayId",
      propertyArrayQuantifier: "every",
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });

  test("Returns true for a boolean condition and valid evaluation context value", () => {
    const condition: BooleanCondition = {
      type: "boolean",
      operator: "isTrue",
      propertyId: "booleanId",
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });

  test("Returns true for a number array condition and valid evaluation context value", () => {
    const condition: NumberArrayCondition = {
      type: "numberArray",
      operator: "isGreaterThan",
      propertyId: "numberArrayId",
      propertyArrayQuantifier: "every",
      operandsQuantifier: "every",
      operands: [-1, 0],
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });

  test("Returns true for a number condition and valid evaluation context value", () => {
    const condition: NumberCondition = {
      type: "number",
      operator: "equals",
      propertyId: "numberId",
      operandsQuantifier: "some",
      operands: [42],
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });

  test("Returns true for a string array condition and valid evaluation context value", () => {
    const condition: StringArrayCondition = {
      type: "stringArray",
      operator: "endsWith",
      propertyId: "stringArrayId",
      propertyArrayQuantifier: "every",
      operandsQuantifier: "some",
      operands: ["@acme.com"],
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });

  test("Returns true for a string condition and valid evaluation context value", () => {
    const condition: StringCondition = {
      type: "string",
      operator: "equals",
      propertyId: "stringId",
      operandsQuantifier: "some",
      operands: ["bar@acme.com"],
    };

    expect(
      evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      ),
    ).toBe(true);
  });
});
