import { describe, expect, test } from "@jest/globals";

import type {
  Condition,
  ConditionType,
} from "../../schema/conditions/Condition";
import { ConditionTypes } from "../../schema/conditions/Condition";
import type { LoliSpec } from "../../schema/LoliSpec";
import type { EvaluationContext } from "../EvaluationContext";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { evaluateCondition } from "./condition";

describe("evaluateCondition", () => {
  const loliSpec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [],
    segments: [
      {
        id: "segmentId",
        name: "Segment",
        conditionSet: {
          operator: "and",
          conditions: [
            { type: "alwaysTrue" },
            {
              type: "string",
              propertyId: "stringPropId",
              operator: "endsWith",
              operandsQuantifier: "some",
              operands: ["@acme.com"],
            },
          ],
        },
      },
    ],
    evaluationContext: {
      properties: [
        {
          type: "boolean",
          path: ["true"],
          name: "True",
          rolloutDiscriminator: false,
          id: "booleanPropId",
        },
        {
          type: "booleanArray",
          path: ["trueArray"],
          name: "True Array",
          rolloutDiscriminator: false,
          id: "booleanArrayPropId",
        },
        {
          type: "number",
          path: ["number"],
          name: "Number",
          rolloutDiscriminator: false,
          id: "numberPropId",
        },
        {
          type: "numberArray",
          path: ["numberArray"],
          name: "Number Array",
          rolloutDiscriminator: false,
          id: "numberArrayPropId",
        },
        {
          type: "string",
          path: ["string"],
          name: "String",
          rolloutDiscriminator: false,
          id: "stringPropId",
        },
        {
          type: "stringArray",
          path: ["stringArray"],
          name: "String Array",
          rolloutDiscriminator: false,
          id: "stringArrayPropId",
        },
      ],
    },
  };

  const evaluationContext: EvaluationContext = {
    true: true,
    trueArray: [true, true],
    number: 42,
    numberArray: [42, 42],
    string: "foo@acme.com",
    stringArray: ["foo@acme.com", "bar@acme.com"],
  };

  const evaluationMetadata: EvaluationMetadata = {
    evaluationDateTime: new Date("2024-05-13T06:00:00.000+02:00"),
    rolloutGroup: 0,
  };

  const testCases: {
    [key in ConditionType]: {
      expected: boolean;
      condition: Condition & { type: key };
    }[];
  } = {
    string: [
      {
        expected: true,
        condition: {
          type: "string",
          operator: "endsWith",
          propertyId: "stringPropId",
          operandsQuantifier: "some",
          operands: ["@acme.com"],
        },
      },
      {
        expected: false,
        condition: {
          type: "string",
          operator: "endsWith",
          propertyId: "stringPropId",
          operandsQuantifier: "some",
          operands: ["@vim.nano"],
        },
      },
    ],
    number: [
      {
        expected: true,
        condition: {
          type: "number",
          propertyId: "numberPropId",
          operator: "equals",
          operandsQuantifier: "some",
          operands: [42],
        },
      },
      {
        expected: false,
        condition: {
          type: "number",
          propertyId: "numberPropId",
          operator: "equals",
          operandsQuantifier: "some",
          operands: [33],
        },
      },
    ],
    boolean: [
      {
        expected: true,
        condition: {
          type: "boolean",
          operator: "isTrue",
          propertyId: "booleanPropId",
        },
      },
      {
        expected: false,
        condition: {
          type: "boolean",
          operator: "isFalse",
          propertyId: "booleanPropId",
        },
      },
    ],
    stringArray: [
      {
        expected: true,
        condition: {
          type: "stringArray",
          propertyArrayQuantifier: "every",
          operator: "endsWith",
          propertyId: "stringArrayPropId",
          operandsQuantifier: "some",
          operands: ["@acme.com"],
        },
      },
      {
        expected: false,
        condition: {
          type: "stringArray",
          propertyArrayQuantifier: "some",
          operator: "endsWith",
          propertyId: "stringArrayPropId",
          operandsQuantifier: "some",
          operands: ["@vim.nano"],
        },
      },
    ],
    numberArray: [
      {
        expected: true,
        condition: {
          type: "numberArray",
          propertyArrayQuantifier: "every",
          propertyId: "numberArrayPropId",
          operator: "equals",
          operandsQuantifier: "some",
          operands: [42],
        },
      },
      {
        expected: false,
        condition: {
          type: "numberArray",
          propertyArrayQuantifier: "some",
          propertyId: "numberArrayPropId",
          operator: "equals",
          operandsQuantifier: "some",
          operands: [33],
        },
      },
    ],
    booleanArray: [
      {
        expected: true,
        condition: {
          type: "booleanArray",
          operator: "isTrue",
          propertyArrayQuantifier: "every",
          propertyId: "booleanArrayPropId",
        },
      },
      {
        expected: false,
        condition: {
          type: "booleanArray",
          operator: "isFalse",
          propertyArrayQuantifier: "some",
          propertyId: "booleanArrayPropId",
        },
      },
    ],
    conditionSet: [
      {
        expected: true,
        condition: {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [{ type: "alwaysTrue" }],
          },
        },
      },
      {
        expected: false,
        condition: {
          type: "conditionSet",
          conditionSet: {
            operator: "nand",
            conditions: [{ type: "alwaysTrue" }],
          },
        },
      },
    ],
    alwaysTrue: [{ expected: true, condition: { type: "alwaysTrue" } }],
    segment: [
      {
        expected: true,
        condition: {
          type: "segment",
          segmentId: "segmentId",
          operator: "isTrue",
        },
      },
      {
        expected: false,
        condition: {
          type: "segment",
          segmentId: "segmentId",
          operator: "isFalse",
        },
      },
    ],
    dateTime: [
      {
        expected: true,
        condition: {
          type: "dateTime",
          operator: "equalsOrIsAfter",
          operand: {
            date: "2024-05-13",
            time: "06:00:00", // equals evaluation metadata date/time
            timezoneOffset: 120,
          },
          timezoneOffsetMode: "localOffset",
        },
      },
      {
        expected: false,
        condition: {
          type: "dateTime",
          operator: "equalsOrIsAfter",
          operand: {
            date: "2024-05-13",
            time: "06:00:01", // one minute too early compared to evaluation metadata date/time
            timezoneOffset: 120,
          },
          timezoneOffsetMode: "localOffset",
        },
      },
    ],
  };

  for (const conditionType of ConditionTypes) {
    describe(`Condition type = ${conditionType}`, () => {
      for (const { expected, condition } of testCases[conditionType]) {
        test(`Returns ${expected} for condition = ${JSON.stringify(condition)}`, () => {
          expect(
            evaluateCondition(
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
