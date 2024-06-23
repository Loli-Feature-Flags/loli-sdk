import type { FeatureFlag } from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Property } from "../schema/Property";
import type { Segment } from "../schema/segment/Segment";

/**
 * Extracts all IDs that are used in the given LoliSpec.
 * Returns an array that may contain duplicates if an ID
 * is used multiple times in the spec.
 *
 * @param loliSpec LoliSpec to extract IDs from.
 * @return Array of all used IDs within the given spec including duplicates.
 */
export function getAllIdsUsedInSpec(loliSpec: LoliSpec): string[] {
  return [
    ...loliSpec.featureFlags.map((featureFlag) => featureFlag.id),
    ...loliSpec.evaluationContext.properties.map((property) => property.id),
    ...loliSpec.segments.map((segment) => segment.id),
  ];
}

/**
 * Returns an array of unique IDs that are being used
 * in the given LoliSpec. The method essentially behaves
 * like getAllIdsUsedInLoliSpec, but removes duplicates.
 *
 * @param loliSpec LoliSpec to extract IDs from.
 * @return Array of unique and used IDs within the given spec without duplicates.
 */
export function getUniqueIdsUsedInSpec(loliSpec: LoliSpec): string[] {
  const usedIds = getAllIdsUsedInSpec(loliSpec);

  const uniqueIds: string[] = [];

  // We want to preserve the order.
  for (const usedId of usedIds) {
    if (!uniqueIds.includes(usedId)) {
      const nrOfUsages = usedIds.filter(
        (otherUsedId) => otherUsedId === usedId,
      ).length;

      if (nrOfUsages === 1) {
        uniqueIds.push(usedId);
      }
    }
  }

  return uniqueIds;
}

/**
 * Returns an array of duplicated IDs in a Loli Spec.
 * Counterpart of function getUniqueIdsUsedInLoliSpec.
 *
 * @param loliSpec LoliSpec to extract IDs from.
 * @return Array of duplicated IDs
 */
export function getDuplicatedIdsUsedInSpec(loliSpec: LoliSpec): string[] {
  const usedIds = getAllIdsUsedInSpec(loliSpec);

  const duplicatedIds: string[] = [];

  // We want to preserve the order.
  for (const usedId of usedIds) {
    if (!duplicatedIds.includes(usedId)) {
      const nrOfUsages = usedIds.filter(
        (otherUsedId) => otherUsedId === usedId,
      ).length;

      if (nrOfUsages > 1) {
        duplicatedIds.push(usedId);
      }
    }
  }

  return duplicatedIds;
}

/**
 * Obtains all feature flags/property/segment objects from the given
 * Loli Spec that use some duplicated ID in the spec.
 * Uses the method getDuplicatedIdsUsedInSpec internally.
 * @param loliSpec Spec to check.
 * @return Object with respective entity arrays. Elements do use a duplicated ID.
 */
export function getSpecEntitiesHavingDuplicatedIds(loliSpec: LoliSpec): {
  featureFlags: FeatureFlag[];
  evaluationContext: {
    properties: Property[];
  };
  segments: Segment[];
} {
  const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

  return {
    featureFlags: loliSpec.featureFlags.filter((featureFlag) =>
      duplicatedIds.includes(featureFlag.id),
    ),
    evaluationContext: {
      properties: loliSpec.evaluationContext.properties.filter((property) =>
        duplicatedIds.includes(property.id),
      ),
    },
    segments: loliSpec.segments.filter((segment) =>
      duplicatedIds.includes(segment.id),
    ),
  };
}
