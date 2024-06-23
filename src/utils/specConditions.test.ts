import { describe, expect, test } from "@jest/globals";

import type { Condition } from "../schema/conditions/Condition";
import type { ConditionSetCondition } from "../schema/conditions/ConditionSetCondition";
import type { ConditionSet } from "../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../schema/LoliSpec";
import {
  getAllConditionsWithPathFromConditionSetRecursively,
  getAllConditionsWithPathFromLoliSpec,
} from "./specConditions";

function createSpec({
  ff2Conditions,
  segment1Conditions,
}: {
  ff2Conditions?: Condition[];
  segment1Conditions?: Condition[];
}): LoliSpec {
  return {
    schemaVersion: 1,
    featureFlags: [
      {
        id: "ff1",
        type: "boolean",
        name: "ff1",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: [] },
      },
      {
        id: "ff2",
        type: "boolean",
        name: "ff2",
        defaultValue: false,
        description: "",
        targeting: {
          enabled: true,
          rules: ff2Conditions
            ? [
                {
                  enabled: true,
                  valuesOnMatch: [],
                  conditionSet: { operator: "and", conditions: ff2Conditions },
                },
              ]
            : [],
        },
      },
    ],
    segments: [
      {
        id: "segment1",
        name: "segment1",
        conditionSet: {
          operator: "and",
          conditions: segment1Conditions ?? [],
        },
      },
      {
        id: "segment2",
        name: "segment2",
        conditionSet: {
          operator: "and",
          conditions: [],
        },
      },
    ],
    evaluationContext: {
      properties: [
        {
          id: "property1",
          name: "property1",
          type: "string",
          path: ["property1"],

          rolloutDiscriminator: true,
        },
        {
          id: "property2",
          name: "property2",
          type: "string",
          path: ["property2"],

          rolloutDiscriminator: true,
        },
      ],
    },
  };
}

describe("getAllConditionsWithPathFromLoliSpec", () => {
  test("Returns no conditions if no conditions are present", () => {
    const loliSpec = createSpec({});

    const conditionsWithPath = getAllConditionsWithPathFromLoliSpec(loliSpec);

    expect(conditionsWithPath.length).toBe(0);
  });

  test("Returns all conditions", () => {
    const ff2Conditions: Condition[] = [
      {
        type: "string",
        propertyId: "email",
        operator: "endsWith",
        operands: ["peter-kuhmann.de"],
        operandsQuantifier: "some",
      },
      {
        type: "string",
        propertyId: "id",
        operator: "equals",
        operands: ["1293761293786"],
        operandsQuantifier: "some",
      },
    ];

    const segment1Conditions: Condition[] = [
      {
        type: "boolean",
        propertyId: "betaTester",
        operator: "isTrue",
      },
      {
        type: "boolean",
        propertyId: "admin",
        operator: "isFalse",
      },
    ];

    const loliSpec = createSpec({ ff2Conditions, segment1Conditions });

    const conditionsWithPath = getAllConditionsWithPathFromLoliSpec(loliSpec);

    expect(conditionsWithPath.length).toBe(4);

    expect(conditionsWithPath[0].path).toEqual([
      "featureFlags",
      1,
      "targeting",
      "rules",
      0,
      "conditionSet",
      0,
    ]);
    expect(conditionsWithPath[0].condition).toBe(ff2Conditions[0]);

    expect(conditionsWithPath[1].path).toEqual([
      "featureFlags",
      1,
      "targeting",
      "rules",
      0,
      "conditionSet",
      1,
    ]);
    expect(conditionsWithPath[1].condition).toBe(ff2Conditions[1]);

    expect(conditionsWithPath[2].path).toEqual([
      "segments",
      0,
      "conditionSet",
      0,
    ]);
    expect(conditionsWithPath[2].condition).toBe(segment1Conditions[0]);

    expect(conditionsWithPath[3].path).toEqual([
      "segments",
      0,
      "conditionSet",
      1,
    ]);
    expect(conditionsWithPath[3].condition).toBe(segment1Conditions[1]);
  });
});

describe("getAllConditionsWithPathFromConditionSetRecursively", () => {
  test("Returns conditions and nested conditions", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        {
          type: "string",
          propertyId: "email",
          operator: "endsWith",
          operands: ["peter-kuhmann.de"],
          operandsQuantifier: "some",
        },
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "string",
                propertyId: "id",
                operator: "equals",
                operands: ["1293761293786"],
                operandsQuantifier: "some",
              },
            ],
          },
        },
      ],
    };

    const conditionsWithPath =
      getAllConditionsWithPathFromConditionSetRecursively(conditionSet);

    expect(conditionsWithPath.length).toBe(2);

    expect(conditionsWithPath[0].path).toEqual([0]);
    expect(conditionsWithPath[0].condition).toBe(conditionSet.conditions[0]);

    expect(conditionsWithPath[1].path).toEqual([1, 0]);
    expect(conditionsWithPath[1].condition).toBe(
      (conditionSet.conditions[1] as ConditionSetCondition).conditionSet
        .conditions[0],
    );
  });

  test("Returns empty array for condition set with empty nested condition set", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };

    const conditionsWithPath =
      getAllConditionsWithPathFromConditionSetRecursively(conditionSet);

    expect(conditionsWithPath.length).toBe(0);
  });

  test("Returns empty array for empty condition set", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [],
    };

    const conditionsWithPath =
      getAllConditionsWithPathFromConditionSetRecursively(conditionSet);

    expect(conditionsWithPath.length).toBe(0);
  });
});
