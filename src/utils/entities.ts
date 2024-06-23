import type { FeatureFlag } from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Property } from "../schema/Property";
import type { Segment } from "../schema/segment/Segment";

/**
 * Tries to find the feature flag denoted by the given ID in the LoliSpec.
 *
 * @param loliSpec LoliSpec to search in.
 * @param featureFlagId ID of feature flag to find.
 * @return Found feature flag or undefined.
 */
export function getFeatureFlagFromLoliSpecById(
  loliSpec: LoliSpec,
  featureFlagId: string,
): FeatureFlag | undefined {
  return loliSpec.featureFlags.find(
    (featureFlag) => featureFlag.id === featureFlagId,
  );
}

/**
 * Tries to find the feature flag denoted by the given featureFlagName in the LoliSpec.
 *
 * @param loliSpec LoliSpec to search in.
 * @param featureFlagName Name of feature flag to find.
 * @return Found feature flag or undefined.
 */
export function getFeatureFlagFromLoliSpecByName(
  loliSpec: LoliSpec,
  featureFlagName: string,
): FeatureFlag | undefined {
  return loliSpec.featureFlags.find(
    (featureFlag) => featureFlag.name === featureFlagName,
  );
}

/**
 * Tries to find the segment denoted by the given ID in the LoliSpec.
 *
 * @param loliSpec LoliSpec to search in.
 * @param segmentId ID of segment to find.
 * @return Found segment or undefined.
 */
export function getSegmentFromLoliSpecById(
  loliSpec: LoliSpec,
  segmentId: string,
): Segment | undefined {
  return loliSpec.segments.find((segment) => segment.id === segmentId);
}

/**
 * Tries to find the property denoted by the given ID in the LoliSpec.
 *
 * @param loliSpec LoliSpec to search in.
 * @param propertyId ID of property to find.
 * @return Found property or undefined.
 */
export function getPropertyFromLoliSpecById(
  loliSpec: LoliSpec,
  propertyId: string,
): Property | undefined {
  return loliSpec.evaluationContext.properties.find(
    (property) => property.id === propertyId,
  );
}
