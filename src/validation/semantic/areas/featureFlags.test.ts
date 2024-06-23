import { describe, expect, test } from "@jest/globals";

import type { BooleanFeatureFlagRule } from "../../../schema/featureFlags/rules/BooleanFeatureFlagRule";
import type { LoliSpec } from "../../../schema/LoliSpec";
import { SemanticIssueType } from "../SemanticIssueType";
import { validateLoliSpecFeatureFlagsSemantically } from "./featureFlags";

function createSpec({
  ff1Name,
  ff2Name,
  ff3Name,
  ff1Rules,
  ff2Rules,
  ff3Rules,
}: {
  ff1Name?: string;
  ff2Name?: string;
  ff3Name?: string;
  ff1Rules?: BooleanFeatureFlagRule[];
  ff2Rules?: BooleanFeatureFlagRule[];
  ff3Rules?: BooleanFeatureFlagRule[];
}): LoliSpec {
  return {
    schemaVersion: 1,
    featureFlags: [
      {
        id: "ff1",
        type: "boolean",
        name: ff1Name ?? "ff1",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: ff1Rules ?? [] },
      },
      {
        id: "ff2",
        type: "boolean",
        name: ff2Name ?? "ff2",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: ff2Rules ?? [] },
      },
      {
        id: "ff3",
        type: "boolean",
        name: ff3Name ?? "ff3",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: ff3Rules ?? [] },
      },
    ],
    evaluationContext: {
      properties: [],
    },
    segments: [],
  };
}

describe("validateLoliSpecFeatureFlagsSemantically", () => {
  describe("Validating unique feature flag names", () => {
    test("Returns no issues for correct schema", () => {
      const spec = createSpec({});

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(true);
    });

    test("Returns issues for feature flags with shared names", () => {
      const spec = createSpec({ ff1Name: "shared", ff3Name: "shared" });

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(false);

      const issues = validation.getIssues();
      expect(issues.length).toBe(2);

      expect(issues[0].path).toEqual(["featureFlags", 0]);
      expect(issues[0].type).toBe(
        SemanticIssueType.DUPLICATED_FEATURE_FLAG_NAME,
      );
      expect(issues[0].message).toContain("shared");
      expect(issues[0].message).toContain(spec.featureFlags[0].id);

      expect(issues[1].path).toEqual(["featureFlags", 2]);
      expect(issues[1].type).toBe(
        SemanticIssueType.DUPLICATED_FEATURE_FLAG_NAME,
      );
      expect(issues[1].message).toContain("shared");
      expect(issues[1].message).toContain(spec.featureFlags[2].id);
    });
  });

  describe("Validating presence of at least one valueOnMatch", () => {
    test("Returns no issues for correct schema with rules that have at least one valueOnMatch", () => {
      const spec = createSpec({
        ff2Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
          },
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
          },
        ],
        ff3Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
          },
        ],
      });

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(true);
    });

    test("Returns issues for incorrect schema with rules that have noe valuesOnMatch", () => {
      const spec = createSpec({
        ff2Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
          },
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [],
          },
        ],
        ff3Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [],
          },
        ],
      });

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(false);

      const issues = validation.getIssues();
      expect(issues.length).toBe(2);

      expect(issues[0].type).toBe(SemanticIssueType.NO_VALUES_ON_MATCH);
      expect(issues[0].path).toEqual([
        "featureFlags",
        1,
        "targeting",
        "rules",
        1,
        "valuesOnMatch",
      ]);
      expect(issues[0].message).toContain("empty");

      expect(issues[1].type).toBe(SemanticIssueType.NO_VALUES_ON_MATCH);
      expect(issues[1].path).toEqual([
        "featureFlags",
        2,
        "targeting",
        "rules",
        0,
        "valuesOnMatch",
      ]);
      expect(issues[1].message).toContain("empty");
    });
  });

  describe("Validating 100% rollout percentages sums", () => {
    test("Returns no issues for correct schema with rules that have 100% rollout percentage", () => {
      const spec = createSpec({
        ff2Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [
              { value: true, rolloutPercentage: 40 },
              { value: true, rolloutPercentage: 60 },
            ],
          },
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
          },
        ],
        ff3Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [
              { value: true, rolloutPercentage: 95.45 },
              { value: true, rolloutPercentage: 4.55 },
            ],
          },
        ],
      });

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(true);
    });

    test("Returns issues for schema with rules that have not a 100% rollout percentage", () => {
      const spec = createSpec({
        ff2Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [
              { value: true, rolloutPercentage: 25.5 },
              { value: true, rolloutPercentage: 50 },
            ],
          },
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 35 }],
          },
        ],
        ff3Rules: [
          {
            enabled: true,
            conditionSet: { operator: "and", conditions: [] },
            valuesOnMatch: [{ value: true, rolloutPercentage: 95.45 }],
          },
        ],
      });

      const validation = validateLoliSpecFeatureFlagsSemantically(spec);

      expect(validation.isValid()).toBe(false);

      const issues = validation.getIssues();
      expect(issues.length).toBe(3);

      expect(issues[0].type).toBe(
        SemanticIssueType.ROLLOUT_PERCENTAGE_SUM_NOT_ONE_HUNDRED,
      );
      expect(issues[0].path).toEqual([
        "featureFlags",
        1,
        "targeting",
        "rules",
        0,
        "valuesOnMatch",
      ]);
      expect(issues[0].message).toContain("75.5%");

      expect(issues[1].type).toBe(
        SemanticIssueType.ROLLOUT_PERCENTAGE_SUM_NOT_ONE_HUNDRED,
      );
      expect(issues[1].path).toEqual([
        "featureFlags",
        1,
        "targeting",
        "rules",
        1,
        "valuesOnMatch",
      ]);
      expect(issues[1].message).toContain("35%");

      expect(issues[2].type).toBe(
        SemanticIssueType.ROLLOUT_PERCENTAGE_SUM_NOT_ONE_HUNDRED,
      );
      expect(issues[2].path).toEqual([
        "featureFlags",
        2,
        "targeting",
        "rules",
        0,
        "valuesOnMatch",
      ]);
      expect(issues[2].message).toContain("95.45%");
    });
  });
});
