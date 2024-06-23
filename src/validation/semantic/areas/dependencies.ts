import type { LoliSpec } from "../../../schema/LoliSpec";
import {
  buildDependencyMap,
  createDependencyMapTraversalByStartEntityId,
} from "../../../utils/dependencies";
import { SemanticIssue } from "../SemanticIssue";
import { SemanticIssueType } from "../SemanticIssueType";
import { SemanticValidation } from "../SemanticValidation";

/**
 * Validates inner spec dependencies semantically.
 *  - Checks if entities' dependencies have cyclic dependencies.
 *  - Check if entities are directly part of a cyclic dependency.
 *
 * @param loliSpec LoliSpec to validate.
 * @return SemanticValidation instance with no issues or validation issues.
 */
export function validateLoliSpecDependenciesSemantically(
  loliSpec: LoliSpec,
): SemanticValidation {
  const validation = new SemanticValidation();

  validateNoCyclicDependenciesExist(loliSpec, validation);

  return validation;
}

/**
 * Check if entities in of the given LoliSpec (featureFlags, segments, properties)
 * are part of a cyclic dependency or if its dependencies have a cyclic dependency.
 *
 * @param loliSpec LoliSpec to check its entities.
 * @param validation Validation to add issues to.
 */
function validateNoCyclicDependenciesExist(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
) {
  const dependencyMap = buildDependencyMap(loliSpec);

  // Feature flags
  for (
    let featureFlagIndex = 0;
    featureFlagIndex < loliSpec.featureFlags.length;
    featureFlagIndex++
  ) {
    const featureFlag = loliSpec.featureFlags[featureFlagIndex];

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      featureFlag.id,
    );

    const path = ["featureFlags", featureFlagIndex];

    if (traversal.isStartEntityPartOfCyclicDependency) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.PART_OF_CYCLIC_DEPENDENCY,
          path,
          `This feature flag is directly part of a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }

    if (traversal.areCyclicDependenciesPresent) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT,
          path,
          `This feature flag dependency tree includes a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }
  }

  // Segments
  for (
    let segmentIndex = 0;
    segmentIndex < loliSpec.segments.length;
    segmentIndex++
  ) {
    const segment = loliSpec.segments[segmentIndex];

    const path = ["segments", segmentIndex];

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      segment.id,
    );

    if (traversal.isStartEntityPartOfCyclicDependency) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.PART_OF_CYCLIC_DEPENDENCY,
          path,
          `This segment is directly part of a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }

    if (traversal.areCyclicDependenciesPresent) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT,
          path,
          `This segment dependency tree includes a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }
  }

  // Properties
  for (
    let propertyIndex = 0;
    propertyIndex < loliSpec.evaluationContext.properties.length;
    propertyIndex++
  ) {
    const property = loliSpec.evaluationContext.properties[propertyIndex];

    const path = ["evaluationContext", "properties", propertyIndex];

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      property.id,
    );

    if (traversal.isStartEntityPartOfCyclicDependency) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.PART_OF_CYCLIC_DEPENDENCY,
          path,
          `This property is directly part of a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }

    if (traversal.areCyclicDependenciesPresent) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT,
          path,
          `This property dependency tree includes a cyclic dependency. Entities causing the cyclic dependencies: ${JSON.stringify(traversal.entitiesCausingCyclicDependencies)}`,
        ),
      );
    }
  }
}
