import type { LoliSpec } from "../../schema/LoliSpec";
import { getEvaluationContextValueByPath } from "../../utils/evaluationContext";
import { fnv1a } from "../../utils/hash/fnv1a";
import type { EvaluationContext } from "../EvaluationContext";

/**
 * Computes the rollout group based on the defined
 * rolloutDiscriminator properties and the corresponding values
 * stored in the given evaluationContext.
 *
 * The algorithm works this way:
 *  - gets all rolloutDiscriminator properties from the given LoliSpec
 *  - sorts these properties by ID
 *  - create empty hashInput string variable
 *  - for each property:
 *      - extract value from evaluationContext
 *      - append JSON.stringify(propertyValue) to hashInput variable
 *  - hash the final hashInput via fnv1a hash algorithm with a range of 0 - 10000
 *  - return hash divided by 100 to get final range of 0 - 100 with a precision of 2 decimals.
 *
 * In the following cases this function will always return -1:
 *  - no rolloutDiscriminator properties exist
 *  - the hashInput is empty
 *      - can be caused by empty string values
 *      - can be caused by missing property values in the evaluation context
 *
 * @param loliSpec LoliSpec used to get information about rolloutDiscriminator properties from.
 * @param evaluationContext EvaluationContext used to get values for rolloutDiscriminator properties.
 * @returns Returns a number in the range of 0 - 100 with a precision of 2 decimals or -1 if the there is no possibility to compute a unique rollout group.
 */
export function computeRolloutGroup(
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
) {
  let hashInput = "";

  const rolloutDiscriminatorPropertiesSortedByIds =
    loliSpec.evaluationContext.properties
      .filter((property) => property.rolloutDiscriminator)
      .sort((a, b) => a.id.localeCompare(b.id));

  if (rolloutDiscriminatorPropertiesSortedByIds.length === 0) {
    return -1;
  }

  for (const rolloutDiscriminatorProperty of rolloutDiscriminatorPropertiesSortedByIds) {
    const { value: propertyValue } = getEvaluationContextValueByPath(
      rolloutDiscriminatorProperty.path,
      evaluationContext,
      rolloutDiscriminatorProperty.type,
    );

    if (propertyValue !== undefined) {
      const propertyValueType = typeof propertyValue;

      // We can append primitives without JSON stringify.
      // This causes an empty end hashInput if all values
      // are empty string values. That would be a state
      // Where we can't distinguish users.
      if (
        propertyValueType === "string" ||
        propertyValueType === "number" ||
        propertyValue === "boolean"
      ) {
        hashInput += `${propertyValue}`.trim();
      } else {
        hashInput += JSON.stringify(propertyValue);
      }
    }
  }

  if (hashInput.length === 0) {
    return -1;
  }

  // Range from 0 to 100 with 2 decimals precision.
  return fnv1a(hashInput, { range: { min: 0, max: 10000 } }) / 100;
}
