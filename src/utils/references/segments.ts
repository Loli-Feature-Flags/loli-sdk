import type { ConditionSet } from "../../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../../schema/LoliSpec";

/**
 * Counts how many conditions in the given ConditionSet reference
 * the segment designated by the given segmentId.
 *
 * @param segmentId ID of segment to count references for.
 * @param conditionSet ConditionSet to count references in.
 * @return Number of segment references in the given ConditionSet.
 */
export function countSegmentReferencesInConditionSet(
  segmentId: string,
  conditionSet: ConditionSet,
): number {
  let referenceCounter = 0;

  for (const condition of conditionSet.conditions) {
    if (condition.type === "segment" && condition.segmentId === segmentId) {
      referenceCounter++;
    } else if (condition.type === "conditionSet") {
      referenceCounter += countSegmentReferencesInConditionSet(
        segmentId,
        condition.conditionSet,
      );
    }
  }

  return referenceCounter;
}

/**
 * Counts how many conditions in total (across feature flags and segments),
 * how many feature flags and how many segments reference the segment
 * designated by the given segmentId.
 *
 * A segment is referenced by a feature flag, if at least one rule and at
 * least one rule condition references the property.
 *
 * A segment is referenced by another segment, if at least one condition of the
 * segment's ConditionSet references the property.
 *
 * The returned totalConditionReferences is the number of all conditions
 * that reference the segment across all feature flags and segments.
 *
 * @param segmentId ID of segment to count references for.
 * @param loliSpec LoliSpec to count references in.
 * @return Object containing total reference counter, feature flags, and segments counter.
 */
export function countSegmentReferences(
  segmentId: string,
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
      const conditionReferenceCount = countSegmentReferencesInConditionSet(
        segmentId,
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
    const conditionReferenceCount = countSegmentReferencesInConditionSet(
      segmentId,
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
 * Convenience function that checks if countSegmentReferences(segmentId, loliSpec).totalConditionReferences
 * is larger than zero.
 *
 * @param segmentId ID of segment to check references for.
 * @param loliSpec LoliSpec to check references in.
 * @return True if any condition across feature flags and segments references the segment, false otherwise.
 */
export function isSegmentReferenced(
  segmentId: string,
  loliSpec: LoliSpec,
): boolean {
  return (
    countSegmentReferences(segmentId, loliSpec).totalConditionReferences > 0
  );
}
