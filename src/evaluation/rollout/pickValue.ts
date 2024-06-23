import type { FeatureFlagRule } from "../../schema/featureFlags/rules/FeatureFlagRule";
import type { EvaluationMetadata } from "../EvaluationMetadata";

/**
 * Picks a value of a feature flag rule to be returned (on match)
 * based on the values rolloutPercentages and the rolloutGroup
 * stored in the given evaluationMetadata.
 *
 * The algorithm works as follows:
 *  - first all valuesOnMatch are sorted by their actual value (ascending so: [1, 2, 3], [false, true, true] or ["aa", "dd", "hh"])
 *  - this prevents that the value distribution stays the same for different orders within the spec
 *  - then this function iterates through all sorted values and while doing that accumulates the rolloutPercentages
 *  - on every iteration the function checks:
 *    - is rolloutGroup <= accumulatedRolloutPercentage or is current value the last one?
 *      - yes: return current value
 *      - no: next
 *
 * Example:
 *  - three values: AAA for 50%, BBB for 30%, and CCC for 20%
 *  - rolloutGroup = 76.45
 *  - iterations:
 *    - 1st iteration
 *      - rolloutPercentageAccumulator = 50%
 *      - 76.45% <= 50% --> false --> skip
 *    - 2nd iteration
 *      - rolloutPercentageAccumulator = 80%
 *      - 76.45% <= 80% --> true --> return BBB
 *
 * In case the rule has no values defined (empty valuesOnMatch array)
 * the given noValuesOnMatchFallback value is returned.
 *
 * @param rule Rule to pick value from to be returned for the rolloutGroup stored in the evaluationMetadata.
 * @param evaluationMetadata EvaluationMetadata which stores the rolloutGroup.
 * @param noValuesOnMatchFallback Fallback value in case the rule's valuesOnMatch array is empty.
 * @returns Value to be rollout out based on valuesOnMatch array and rolloutGroup. Fallback value in case valuesOnMatch array of rule is empty.
 */
export function pickValueToBeRolledOut<RULE extends FeatureFlagRule>(
  rule: RULE,
  evaluationMetadata: EvaluationMetadata,
  noValuesOnMatchFallback: RULE["valuesOnMatch"][number]["value"],
): RULE["valuesOnMatch"][number]["value"] {
  // We sort the valuesOnMatch by their actual value.
  // This way, changed orders in the spec don't change
  // which value a user receives, but only changes
  // values, nr. of values, or changed rollout percentages
  // can influence the value rollout distribution.
  const valuesOnMatchSortedByValue = [...rule.valuesOnMatch].sort((a, b) => {
    if (typeof a.value === "string" && typeof b.value === "string") {
      return a.value.localeCompare(b.value);
    } else {
      return a.value === b.value ? 0 : a.value > b.value ? 1 : -1;
    }
  });

  let rolloutPercentageAccumulator = 0;

  for (
    let valueOnMatchIndex = 0;
    valueOnMatchIndex < valuesOnMatchSortedByValue.length;
    valueOnMatchIndex++
  ) {
    const valueOnMatch = valuesOnMatchSortedByValue[valueOnMatchIndex];

    // We sum the rollout percentages. If the
    // pre-calculated "rolloutGroup" which is between 0 and 100
    // is then in the current "bucket"/"area", we can give that
    // group the current value.
    //
    // Example:
    //  - three values: AAA for 50%, BBB for 30%, and CCC for 20%
    //  - rolloutGroup = 76.45
    //  - iterations:
    //    - 1st iteration
    //      - rolloutPercentageAccumulator = 50%
    //      - 76.45% <= 50% --> false --> skip
    //    - 2nd iteration
    //      - rolloutPercentageAccumulator = 80%
    //      - 76.45% <= 80% --> true --> return BBB
    rolloutPercentageAccumulator += valueOnMatch.rolloutPercentage;

    // Return value of current value if rolloutGroup shall receive it
    // OR if there is at least value, but it's the last (although rolloutGroup) is not matched.
    // --> no correct percentage distribution in the latter case, but this
    // guarantees availability first. Sum of 100% must be guaranteed via semantic validation.
    if (
      evaluationMetadata.rolloutGroup <= rolloutPercentageAccumulator ||
      valueOnMatchIndex === valuesOnMatchSortedByValue.length - 1
    ) {
      return valueOnMatch.value;
    }
  }

  // In case no values are defined.
  return noValuesOnMatchFallback;
}
