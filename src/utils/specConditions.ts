import type { Condition } from "../schema/conditions/Condition";
import type { ConditionSet } from "../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Path } from "../types/Path";

/**
 * Retrieves all condition objects together with a path array
 * from the given LoliSpec that are being used by spec
 * feature flags and segments.
 *
 * Does not return condition set conditions. Instead, it recursively
 * retrieves nested conditions of condition set conditions too.
 *
 * @param loliSpec LoliSpec to retrieve conditions from.
 * @returns Array of object holding condition objects and path array designating where the corresponding conditions are located within the spec.
 */
export function getAllConditionsWithPathFromLoliSpec(
  loliSpec: LoliSpec,
): { path: Path; condition: Condition }[] {
  const conditionsWithPath: {
    path: Path;
    condition: Condition;
  }[] = [];

  // Go through all feature flags and check rules/condition sets recursively.
  for (
    let featureFlagIndex = 0;
    featureFlagIndex < loliSpec.featureFlags.length;
    featureFlagIndex++
  ) {
    const featureFlag = loliSpec.featureFlags[featureFlagIndex];

    for (
      let ruleIndex = 0;
      ruleIndex < featureFlag.targeting.rules.length;
      ruleIndex++
    ) {
      const rule = featureFlag.targeting.rules[ruleIndex];

      const pathPrefix = [
        "featureFlags",
        featureFlagIndex,
        "targeting",
        "rules",
        ruleIndex,
        "conditionSet",
      ];

      conditionsWithPath.push(
        ...getAllConditionsWithPathFromConditionSetRecursively(
          rule.conditionSet,
          pathPrefix,
        ),
      );
    }
  }

  // Go through all segments condition sets recursively.
  for (
    let segmentIndex = 0;
    segmentIndex < loliSpec.segments.length;
    segmentIndex++
  ) {
    const segment = loliSpec.segments[segmentIndex];

    const pathPrefix = ["segments", segmentIndex, "conditionSet"];

    conditionsWithPath.push(
      ...getAllConditionsWithPathFromConditionSetRecursively(
        segment.conditionSet,
        pathPrefix,
      ),
    );
  }

  return conditionsWithPath;
}

/**
 * Returns all conditions that are being defined within the given
 * condition set along with the path array of these conditions within the
 * given condition set.
 *
 * Does not return condition set conditions. Instead, it recursively
 * retrieves nested conditions of condition set conditions too.
 *
 * @param conditionSet ConditionSet to retrieve conditions from.
 * @param prefixPath Optional path to be prepended to returned entries.
 * @returns Array of objects that hold a path array and the corresponding condition object.
 */
export function getAllConditionsWithPathFromConditionSetRecursively(
  conditionSet: ConditionSet,
  prefixPath?: Path,
): { path: Path; condition: Condition }[] {
  const conditionsWithPath: {
    path: Path;
    condition: Condition;
  }[] = [];

  for (
    let conditionIndex = 0;
    conditionIndex < conditionSet.conditions.length;
    conditionIndex++
  ) {
    const condition = conditionSet.conditions[conditionIndex];
    const path = prefixPath
      ? [...prefixPath, conditionIndex]
      : [conditionIndex];

    if (condition.type === "conditionSet") {
      conditionsWithPath.push(
        ...getAllConditionsWithPathFromConditionSetRecursively(
          condition.conditionSet,
          path,
        ),
      );
    } else {
      conditionsWithPath.push({ path, condition });
    }
  }

  return conditionsWithPath;
}
