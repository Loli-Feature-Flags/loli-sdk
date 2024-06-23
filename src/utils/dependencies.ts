import type { PropertyCondition } from "../schema/conditions/Condition";
import { PropertyConditionTypes } from "../schema/conditions/Condition";
import type { ConditionSet } from "../schema/conditionSet/ConditionSet";
import type { FeatureFlag } from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import type { Property } from "../schema/Property";
import type { Segment } from "../schema/segment/Segment";
import { getAllConditionsWithPathFromConditionSetRecursively } from "./specConditions";

export type DependencyMapFeatureFlagEntity = {
  type: "featureFlag";
  id: string;
  featureFlag: FeatureFlag;
};

export type DependencyMapSegmentEntity = {
  type: "segment";
  id: string;
  segment: Segment;
};

export type DependencyMapPropertyEntity = {
  type: "property";
  id: string;
  property: Property;
};

export type DependencyMapEntity =
  | DependencyMapFeatureFlagEntity
  | DependencyMapSegmentEntity
  | DependencyMapPropertyEntity;

export type DependencyMap = Map<DependencyMapEntity, DependencyMapEntity[]>;

export type DependencyMapEntry = [DependencyMapEntity, DependencyMapEntity[]];

export type DependencyMapTraversal = {
  startEntity: DependencyMapEntity;
  dependencies: DependencyMapEntity[];
  entitiesCausingCyclicDependencies: DependencyMapEntity[];
  cyclicDependencyTargets: DependencyMapEntity[];
  areCyclicDependenciesPresent: boolean;
  isStartEntityPartOfCyclicDependency: boolean;
};

/**
 * Trys to find a dependency map entry (key, value)
 * in the given dependency map by the given keyEntityId.
 *
 * @param dependencyMap Dependency map to search in.
 * @param keyEntityId ID of key entity to search for.
 * @return Entry array (key, value) or undefined if not found.
 */
export function getEntryFromDependencyMapByKeyId(
  dependencyMap: DependencyMap,
  keyEntityId: string,
): DependencyMapEntry | undefined {
  return Array.from(dependencyMap.entries()).find((entry) => {
    return entry[0].id === keyEntityId;
  });
}

/**
 * Trys to find a dependency map entry (key, value)
 * in the given dependency map by searching entry
 * whose key entity is matching the given entity.
 *
 * @param dependencyMap Dependency map to search in.
 * @param entity Entity to search matching key entity/entry for.
 * @return Entry array (key, value) or undefined if not found.
 */
export function getMatchingEntryFromDependencyMap(
  dependencyMap: DependencyMap,
  entity: DependencyMapEntity,
): DependencyMapEntry | undefined {
  const directMatch = dependencyMap.get(entity);

  if (directMatch) {
    return [entity, directMatch];
  }

  return Array.from(dependencyMap.entries()).find((entry) => {
    return doDependencyMapEntitiesEqual(entry[0], entity);
  });
}

/**
 * First tries to find an existing entry by the given keyEntity.
 * If such an entry exists, it is returned.
 *
 * If not, a new mapping is added to the given dependency map.
 * The given keyEntity will be the key and a new empty array the value.
 *
 * @param dependencyMap Dependency map to get existing entry from or to create new entry in.
 * @param keyEntity Key entity to get existing entry for or to be used for new entry creation.
 * @return Map entry array (key, values) being either an existing entry or a newly created one.
 */
function getOrPutDependencyMapEntry(
  dependencyMap: DependencyMap,
  keyEntity: DependencyMapEntity,
): DependencyMapEntry {
  const existingEntry = getMatchingEntryFromDependencyMap(
    dependencyMap,
    keyEntity,
  );

  if (existingEntry) {
    return existingEntry;
  }

  const newArray: DependencyMapEntity[] = [];
  dependencyMap.set(keyEntity, newArray);

  return [keyEntity, newArray];
}

/**
 * Helper function to see if two dependency map entities are equal based on:
 *  - type
 *  - id
 *  - featureFlag/segment/property strict equality/reference
 *
 * @param left Entity one.
 * @param right Entity two.
 * @return True, if the conditions mentioned above are true, false otherwise.
 */
function doDependencyMapEntitiesEqual(
  left: DependencyMapEntity,
  right: DependencyMapEntity,
) {
  if (left === right) {
    return true;
  }

  return (
    (left.type === "featureFlag" &&
      left.type === right.type &&
      left.id === right.id &&
      left.featureFlag === right.featureFlag) ||
    (left.type === "segment" &&
      left.type === right.type &&
      left.id === right.id &&
      left.segment === right.segment) ||
    (left.type === "property" &&
      left.type === right.type &&
      left.id === right.id &&
      left.property === right.property)
  );
}

/**
 * Constructs a dependency map for the given LoliSpec.
 * A dependency is literally a map instance.
 *
 * The keys are DependencyMapEntity objects.
 * The mapped values are arrays of DependencyMapEntity objects.
 *
 * The semantics: The LoliSpec entity denoted by the key entity
 * is referencing/depending on the LoliSpec entities denoted by
 * the entities in the value array.
 *
 * @param loliSpec LoliSpec to construct dependency map for.
 * @return Dependency map that maps spec entities (key) to spec entities (values) the key entity is referencing/depending on.
 */
export function buildDependencyMap(loliSpec: LoliSpec): DependencyMap {
  const dependencyMap: DependencyMap = new Map();

  function handleConditionSet(
    mappedReferences: DependencyMapEntity[],
    conditionSet: ConditionSet,
  ) {
    const conditionsWithPath =
      getAllConditionsWithPathFromConditionSetRecursively(conditionSet);

    for (const { condition } of conditionsWithPath) {
      if (PropertyConditionTypes.includes(condition.type)) {
        const property = loliSpec.evaluationContext.properties.find(
          (specProperty) =>
            specProperty.id === (condition as PropertyCondition).propertyId,
        );

        // Existence of properties is
        // validated by other validation methods.
        if (!property) {
          continue;
        }

        mappedReferences.push(
          getOrPutDependencyMapEntry(dependencyMap, {
            type: "property",
            id: property.id,
            property,
          })[0],
        );
      } else if (condition.type === "segment") {
        const segment = loliSpec.segments.find(
          (specSegment) => specSegment.id === condition.segmentId,
        );

        // Existence of segments is
        // validated by other validation methods.
        if (!segment) {
          continue;
        }

        mappedReferences.push(
          getOrPutDependencyMapEntry(dependencyMap, {
            type: "segment",
            id: segment.id,
            segment,
          })[0],
        );
      }
    }
  }

  for (const property of loliSpec.evaluationContext.properties) {
    getOrPutDependencyMapEntry(dependencyMap, {
      type: "property",
      id: property.id,
      property,
    });
  }

  for (const featureFlag of loliSpec.featureFlags) {
    const [, mappedReferences] = getOrPutDependencyMapEntry(dependencyMap, {
      type: "featureFlag",
      id: featureFlag.id,
      featureFlag: featureFlag,
    });

    for (const rule of featureFlag.targeting.rules) {
      handleConditionSet(mappedReferences, rule.conditionSet);
    }
  }

  for (const segment of loliSpec.segments) {
    const [, mappedReferences] = getOrPutDependencyMapEntry(dependencyMap, {
      type: "segment",
      id: segment.id,
      segment,
    });

    handleConditionSet(mappedReferences, segment.conditionSet);
  }

  return dependencyMap;
}

/**
 * Finds all direct and transient dependencies of the given
 * keyEntity in the dependency map.
 *
 * This method returns a flat array of all direct and transient
 * references/dependencies.
 *
 * The method will return once no new entities were found.
 *
 * In case there is a cyclic dependency, the method will safely
 * return.
 *
 * To check if there is a cyclic dependency present, check
 * if the length of the returned "cyclicDependencies" array is not empty or
 * if the flag "areCyclicDependenciesPresent" is true.
 *
 * @param dependencyMap Dependency map to use for extracting all direct and transient dependencies.
 * @param startEntityId ID of entity to start dependencies traversal from.
 * @return Traversal object with all direct and transient dependencies of start entity and cyclic dependency information.
 */
export function createDependencyMapTraversalByStartEntityId(
  dependencyMap: DependencyMap,
  startEntityId: string,
): DependencyMapTraversal {
  const startEntry = getEntryFromDependencyMapByKeyId(
    dependencyMap,
    startEntityId,
  );

  if (!startEntry) {
    throw new Error("No key entity found in dependency map for startEntityId");
  }

  const [startEntityKey] = startEntry;

  // Recursive traversal
  function traverseDependencies(
    check: DependencyMapEntity,
    dependencies: DependencyMapEntity[],
    entitiesCausingCyclicDependencies: DependencyMapEntity[],
    cyclicDependencyTargets: DependencyMapEntity[],
    seenBefore: DependencyMapEntity[] = [],
  ) {
    const entry = getMatchingEntryFromDependencyMap(dependencyMap, check);

    if (!entry) {
      throw new Error("Entity to check not found in dependency map.");
    }

    const [key, mapped] = entry;

    if (mapped.length === 0) {
      return;
    }

    const newSeenBefore = [...seenBefore, key];

    for (const dependency of mapped) {
      // Cyclic dependency detected.
      if (seenBefore.includes(dependency)) {
        if (!entitiesCausingCyclicDependencies.includes(key)) {
          entitiesCausingCyclicDependencies.push(key);
        }

        if (!cyclicDependencyTargets.includes(dependency)) {
          cyclicDependencyTargets.push(dependency);
        }
      } else {
        // Handle normal dependency case
        if (!dependencies.includes(dependency)) {
          dependencies.push(dependency);
        }

        traverseDependencies(
          dependency,
          dependencies,
          entitiesCausingCyclicDependencies,
          cyclicDependencyTargets,
          newSeenBefore,
        );
      }
    }
  }

  const dependencies: DependencyMapEntity[] = [];
  const entitiesCausingCyclicDependencies: DependencyMapEntity[] = [];
  const cyclicDependencyTargets: DependencyMapEntity[] = [];

  traverseDependencies(
    startEntityKey,
    dependencies,
    entitiesCausingCyclicDependencies,
    cyclicDependencyTargets,
  );

  return {
    startEntity: startEntityKey,
    dependencies,
    entitiesCausingCyclicDependencies,
    cyclicDependencyTargets,
    areCyclicDependenciesPresent: entitiesCausingCyclicDependencies.length > 0,
    isStartEntityPartOfCyclicDependency:
      entitiesCausingCyclicDependencies.includes(startEntityKey) ||
      cyclicDependencyTargets.includes(startEntityKey),
  };
}
