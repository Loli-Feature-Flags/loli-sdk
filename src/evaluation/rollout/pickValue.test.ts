import { describe, expect, test } from "@jest/globals";

import type { BooleanFeatureFlagRule } from "../../schema/featureFlags/rules/BooleanFeatureFlagRule";
import type { NumberFeatureFlagRule } from "../../schema/featureFlags/rules/NumberFeatureFlagRule";
import type { StringFeatureFlagRule } from "../../schema/featureFlags/rules/StringFeatureFlagRule";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { pickValueToBeRolledOut } from "./pickValue";

describe("pickValueToBeRolledOut", () => {
  describe("Boolean feature flag rules", () => {
    test("Returns fallback value for empty valuesOnMatch array", () => {
      const rule: BooleanFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 0,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(
        rule,
        evaluationMetadata,
        false,
      );

      expect(rolloutValue).toBe(false);
    });

    test("Returns first value if rolloutGroup < 0", () => {
      const rule: BooleanFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: -1,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(
        rule,
        evaluationMetadata,
        false,
      );

      expect(rolloutValue).toBe(true);
    });

    test("Returns last value if rolloutGroup > 100", () => {
      const rule: BooleanFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: true, rolloutPercentage: 60 },
          { value: false, rolloutPercentage: 40 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 101,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(
        rule,
        evaluationMetadata,
        false,
      );

      expect(rolloutValue).toBe(true);
    });

    test("Returns last value if rolloutGroup = 99 but sum of percentages is only 80", () => {
      const rule: BooleanFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: true, rolloutPercentage: 60 },
          { value: false, rolloutPercentage: 20 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 99,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(
        rule,
        evaluationMetadata,
        false,
      );

      expect(rolloutValue).toBe(true);
    });

    test("Returns correct values based on rolloutGroup", () => {
      const rule: BooleanFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: true, rolloutPercentage: 60 },
          { value: false, rolloutPercentage: 40 },
        ],
      };

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 40,
            evaluationDateTime: new Date(),
          },
          false,
        ),
      ).toBe(false);

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 100,
            evaluationDateTime: new Date(),
          },
          false,
        ),
      ).toBe(true);
    });
  });

  describe("Number feature flag rules", () => {
    test("Returns fallback value for empty valuesOnMatch array", () => {
      const rule: NumberFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 0,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, 0);

      expect(rolloutValue).toBe(0);
    });

    test("Returns first value if rolloutGroup < 0", () => {
      const rule: NumberFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [{ value: 42, rolloutPercentage: 100 }],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: -1,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, 0);

      expect(rolloutValue).toBe(42);
    });

    test("Returns last value if rolloutGroup > 100", () => {
      const rule: NumberFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: 42, rolloutPercentage: 60 },
          { value: 12, rolloutPercentage: 40 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 101,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, 0);

      expect(rolloutValue).toBe(42);
    });

    test("Returns last value if rolloutGroup = 99 but sum of percentages is only 80", () => {
      const rule: NumberFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: 42, rolloutPercentage: 60 },
          { value: 12, rolloutPercentage: 20 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 99,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, 0);

      expect(rolloutValue).toBe(42);
    });

    test("Returns correct values based on rolloutGroup", () => {
      const rule: NumberFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: 42, rolloutPercentage: 60 },
          { value: 12, rolloutPercentage: 30 },
          { value: 6, rolloutPercentage: 10 },
        ],
      };

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 10,
            evaluationDateTime: new Date(),
          },
          0,
        ),
      ).toBe(6);

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 40,
            evaluationDateTime: new Date(),
          },
          0,
        ),
      ).toBe(12);

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 40.1,
            evaluationDateTime: new Date(),
          },
          0,
        ),
      ).toBe(42);
    });
  });

  describe("String feature flag rules", () => {
    test("Returns fallback value for empty valuesOnMatch array", () => {
      const rule: StringFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 0,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, "");

      expect(rolloutValue).toBe("");
    });

    test("Returns first value if rolloutGroup < 0", () => {
      const rule: StringFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [{ value: "ddd", rolloutPercentage: 100 }],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: -1,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, "");

      expect(rolloutValue).toBe("ddd");
    });

    test("Returns last value if rolloutGroup > 100", () => {
      const rule: StringFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: "ddd", rolloutPercentage: 60 },
          { value: "aaa", rolloutPercentage: 40 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 101,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, "");

      expect(rolloutValue).toBe("ddd");
    });

    test("Returns last value if rolloutGroup = 99 but sum of percentages is only 80", () => {
      const rule: StringFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: "ddd", rolloutPercentage: 60 },
          { value: "aaa", rolloutPercentage: 20 },
        ],
      };

      const evaluationMetadata: EvaluationMetadata = {
        rolloutGroup: 99,
        evaluationDateTime: new Date(),
      };

      const rolloutValue = pickValueToBeRolledOut(rule, evaluationMetadata, "");

      expect(rolloutValue).toBe("ddd");
    });

    test("Returns correct values based on rolloutGroup", () => {
      const rule: StringFeatureFlagRule = {
        enabled: true,
        conditionSet: { operator: "and", conditions: [] },
        valuesOnMatch: [
          { value: "ddd", rolloutPercentage: 60 },
          { value: "ccc", rolloutPercentage: 30 },
          { value: "aaa", rolloutPercentage: 10 },
        ],
      };

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 10,
            evaluationDateTime: new Date(),
          },
          "",
        ),
      ).toBe("aaa");

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 40,
            evaluationDateTime: new Date(),
          },
          "",
        ),
      ).toBe("ccc");

      expect(
        pickValueToBeRolledOut(
          rule,
          {
            rolloutGroup: 75.6754,
            evaluationDateTime: new Date(),
          },
          "",
        ),
      ).toBe("ddd");
    });
  });
});
