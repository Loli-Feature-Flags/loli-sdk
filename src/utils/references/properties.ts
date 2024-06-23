import type { PropertyCondition } from "../../schema/conditions/Condition";
import { PropertyConditionTypes } from "../../schema/conditions/Condition";
import type { ConditionSet } from "../../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../../schema/LoliSpec";

/**
 * Counts how many conditions in the given ConditionSet reference
 * the property designated by the given propertyId.
 *
 * @param propertyId ID of property to count references for.
 * @param conditionSet ConditionSet to count references in.
 * @return Number of property references in the given ConditionSet.
 */
export function countPropertyReferencesInConditionSet(
  propertyId: string,
  conditionSet: ConditionSet,
): number {
  let referenceCounter = 0;

  for (const condition of conditionSet.conditions) {
    // Check if condition is property check condition and if propertyId matches.
    if (
      PropertyConditionTypes.includes(condition.type) &&
      (condition as PropertyCondition).propertyId === propertyId
    ) {
      referenceCounter++;
    }

    // Check for sub condition set
    if (condition.type === "conditionSet") {
      referenceCounter += countPropertyReferencesInConditionSet(
        propertyId,
        condition.conditionSet,
      );
    }
  }

  return referenceCounter;
}

/**
 * Counts how many conditions in total (across feature flags and segments),
 * how many feature flags and how many segments reference the property
 * designated by the given propertyId.
 *
 * A property is referenced by a feature flag, if at least one rule and at
 * least one rule condition references the property.
 *
 * A property is referenced by a segment, if at least one condition of the
 * segment's ConditionSet references the property.
 *
 * The returned totalConditionReferences is the number of all conditions
 * that reference the property across all feature flags and segments.
 *
 * @param propertyId ID of property to count references for.
 * @param loliSpec LoliSpec to count references in.
 * @return Object containing total reference counter, feature flags, and segments counter.
 */
export function countPropertyReferences(
  propertyId: string,
  loliSpec: LoliSpec,
): {
  segmentReferences: number;
  featureFlagReferences: number;
  totalConditionReferences: number;
} {
  let segmentReferences = 0;
  let featureFlagReferences = 0;
  let conditionReferences = 0;

  // Count in feature flags
  for (const featureFlag of loliSpec.featureFlags) {
    let referencedInFeatureFlag = false;

    for (const rule of featureFlag.targeting.rules) {
      const conditionReferenceCount = countPropertyReferencesInConditionSet(
        propertyId,
        rule.conditionSet,
      );

      conditionReferences += conditionReferenceCount;

      if (conditionReferenceCount > 0) {
        referencedInFeatureFlag = true;
      }
    }

    if (referencedInFeatureFlag) {
      featureFlagReferences++;
    }
  }

  // Count in segments
  for (const segment of loliSpec.segments) {
    const conditionReferenceCount = countPropertyReferencesInConditionSet(
      propertyId,
      segment.conditionSet,
    );

    conditionReferences += conditionReferenceCount;

    if (conditionReferenceCount > 0) {
      segmentReferences++;
    }
  }

  return {
    segmentReferences,
    featureFlagReferences,
    totalConditionReferences: conditionReferences,
  };
}

/**
 * Convenience function that checks if countPropertyReferences(propertyId, loliSpec).totalConditionReferences
 * is larger than zero.
 *
 * @param propertyId ID of property to check references for.
 * @param loliSpec LoliSpec to check references in.
 * @return True if any condition across feature flags and segments references the property, false otherwise.
 */
export function isPropertyReferenced(
  propertyId: string,
  loliSpec: LoliSpec,
): boolean {
  return (
    countPropertyReferences(propertyId, loliSpec).totalConditionReferences > 0
  );
}
