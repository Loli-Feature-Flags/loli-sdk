import type { LoliSpec } from "../../../schema/LoliSpec";
import { getSpecEntitiesHavingDuplicatedIds } from "../../../utils/ids";
import { SemanticIssue } from "../SemanticIssue";
import { SemanticIssueType } from "../SemanticIssueType";
import { SemanticValidation } from "../SemanticValidation";

/**
 * Validates the schema basics semantically.
 *
 * This includes:
 *  - all entities (feature flags, segments, properties) have unique IDs
 *
 * @param loliSpec Spec to check.
 * @return SemanticValidation instance carrying issues or no issues.
 */
export function validateLoliSpecSchemaSemantically(
  loliSpec: LoliSpec,
): SemanticValidation {
  const validation = new SemanticValidation();

  validateLoliSpecSchemaUniqueIds(loliSpec, validation);

  return validation;
}

/**
 * Adds issues for all feature flags, segments and properties that have a non-unique id.
 *
 * @param loliSpec Loli Spec.
 * @param validation Validation to add issues to.
 */
function validateLoliSpecSchemaUniqueIds(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
) {
  const entitiesWithDuplicatedIds =
    getSpecEntitiesHavingDuplicatedIds(loliSpec);

  for (const featureFlag of entitiesWithDuplicatedIds.featureFlags) {
    validation.addIssue(
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["featureFlags", loliSpec.featureFlags.indexOf(featureFlag)],
        `Feature flag uses the ID "${featureFlag.id}" which is being used by other spec entities too.`,
      ),
    );
  }

  for (const segment of entitiesWithDuplicatedIds.segments) {
    validation.addIssue(
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["segments", loliSpec.segments.indexOf(segment)],
        `Segment uses the ID "${segment.id}" which is being used by other spec entities too.`,
      ),
    );
  }

  for (const property of entitiesWithDuplicatedIds.evaluationContext
    .properties) {
    validation.addIssue(
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        [
          "evaluationContext",
          "properties",
          loliSpec.evaluationContext.properties.indexOf(property),
        ],
        `Property uses the ID "${property.id}" which is being used by other spec entities too.`,
      ),
    );
  }
}
