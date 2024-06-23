import { describe, expect, test } from "@jest/globals";

import type { Condition } from "../../../schema/conditions/Condition";
import type { LoliSpec } from "../../../schema/LoliSpec";
import { SemanticIssueType } from "../SemanticIssueType";
import { validateLoliSpecConditionsSemantically } from "./conditions";

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
          type: "boolean",
          path: ["property2"],

          rolloutDiscriminator: true,
        },
      ],
    },
  };
}

describe("validateLoliSpecConditionsSemantically", () => {
  test("Doesn't create issues for correct spec without conditions", () => {
    const loliSpec = createSpec({});

    const validation = validateLoliSpecConditionsSemantically(loliSpec);

    expect(validation.isValid()).toBe(true);
  });

  test("Doesn't create issues for correct spec with some conditions", () => {
    const ff2Conditions: Condition[] = [
      {
        type: "string",
        propertyId: "property1",
        operator: "endsWith",
        operands: ["peter-kuhmann.de"],
        operandsQuantifier: "some",
      },
      {
        type: "segment",
        segmentId: "segment1",
        operator: "isTrue",
      },
    ];

    const segment1Conditions: Condition[] = [
      {
        type: "boolean",
        propertyId: "property2",
        operator: "isTrue",
      },
    ];

    const loliSpec = createSpec({ ff2Conditions, segment1Conditions });

    const validation = validateLoliSpecConditionsSemantically(loliSpec);

    expect(validation.isValid()).toBe(true);
  });

  test("Creates issues for conditions referencing non-existing segments and properties", () => {
    const ff2Conditions: Condition[] = [
      {
        type: "string",
        propertyId: "property42",
        operator: "endsWith",
        operands: ["peter-kuhmann.de"],
        operandsQuantifier: "some",
      },
      {
        type: "segment",
        segmentId: "segment42",
        operator: "isTrue",
      },
    ];

    const segment1Conditions: Condition[] = [
      {
        type: "boolean",
        propertyId: "property42",
        operator: "isTrue",
      },
    ];

    const loliSpec = createSpec({ ff2Conditions, segment1Conditions });

    const validation = validateLoliSpecConditionsSemantically(loliSpec);

    expect(validation.isValid()).toBe(false);

    const issues = validation.getIssues();
    expect(issues.length).toBe(3);

    expect(issues[0].type).toBe(
      SemanticIssueType.NON_EXISTING_SEGMENT_REFERENCED,
    );
    expect(issues[0].path).toEqual([
      "featureFlags",
      1,
      "targeting",
      "rules",
      0,
      "conditionSet",
      1,
    ]);

    expect(issues[1].type).toBe(
      SemanticIssueType.NON_EXISTING_PROPERTY_REFERENCED,
    );
    expect(issues[1].path).toEqual([
      "featureFlags",
      1,
      "targeting",
      "rules",
      0,
      "conditionSet",
      0,
    ]);

    expect(issues[2].type).toBe(
      SemanticIssueType.NON_EXISTING_PROPERTY_REFERENCED,
    );
    expect(issues[2].path).toEqual(["segments", 0, "conditionSet", 0]);
  });

  test("Creates issues for property conditions referencing properties of wrong data type", () => {
    const ff2Conditions: Condition[] = [
      {
        type: "string",
        propertyId: "property2",
        operator: "endsWith",
        operands: ["peter-kuhmann.de"],
        operandsQuantifier: "some",
      },
    ];

    const segment1Conditions: Condition[] = [
      {
        type: "number",
        propertyId: "property1",
        operator: "isOdd",
        operands: [],
        operandsQuantifier: "some",
      },
    ];

    const loliSpec = createSpec({ ff2Conditions, segment1Conditions });

    const validation = validateLoliSpecConditionsSemantically(loliSpec);

    expect(validation.isValid()).toBe(false);

    const issues = validation.getIssues();

    expect(issues[0].type).toBe(
      SemanticIssueType.CONDITION_PROPERTY_DATA_TYPE_MISMATCH,
    );
    expect(issues[0].path).toEqual([
      "featureFlags",
      1,
      "targeting",
      "rules",
      0,
      "conditionSet",
      0,
    ]);
    expect(issues[0].message).toContain("boolean");
    expect(issues[0].message).toContain("string");

    expect(issues[1].type).toBe(
      SemanticIssueType.CONDITION_PROPERTY_DATA_TYPE_MISMATCH,
    );
    expect(issues[1].path).toEqual(["segments", 0, "conditionSet", 0]);
    expect(issues[1].message).toContain("number");
    expect(issues[1].message).toContain("string");
  });
});
