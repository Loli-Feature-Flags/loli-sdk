import { LoliSpecSemanticIssuesError } from "../../../errors/types/LoliSpecSemanticIssuesError";
import type { LoliSpec } from "../../../schema/LoliSpec";
import { validateLoliSpecConditionsSemantically } from "./conditions";
import { validateLoliSpecDependenciesSemantically } from "./dependencies";
import { validateLoliSpecFeatureFlagsSemantically } from "./featureFlags";
import { validateLoliSpecPropertiesSemantically } from "./properties";
import { validateLoliSpecSchemaSemantically } from "./schema";

/**
 * Performs all semantic sub validations:
 *  - general semantic schema validation (like duplicated IDs)
 *  - semantic property validation
 *  - semantic feature flag validation
 *  - dependencies validation
 *  - conditions validation
 *
 *  Combines all issues of all sub validation.
 *
 * @param loliSpec LoliSpec to validate semantically.
 */
export function validateLoliSpecSemantically(loliSpec: LoliSpec) {
  const schemaSemanticValidation = validateLoliSpecSchemaSemantically(loliSpec);

  const featureFlagsSemanticValidation =
    validateLoliSpecFeatureFlagsSemantically(loliSpec);

  const propertiesSemanticValidation =
    validateLoliSpecPropertiesSemantically(loliSpec);

  const dependenciesValidation =
    validateLoliSpecDependenciesSemantically(loliSpec);

  const conditionsSemanticValidation =
    validateLoliSpecConditionsSemantically(loliSpec);

  return schemaSemanticValidation.combine(
    featureFlagsSemanticValidation,
    propertiesSemanticValidation,
    dependenciesValidation,
    conditionsSemanticValidation,
  );
}

/**
 * Asserts that the given LoliSpec is semantically valid
 * according to {@link validateLoliSpecSemantically}.
 *
 * If the LoliSpec is invalid, a {@link LoliSpecSemanticIssuesError}
 * is thrown with the semantic validation that carries all issues.
 *
 * @param loliSpec LoliSpec to validate semantically.
 * @returns Given LoliSpec.
 */
export function assertSemanticallyValidLoliSpec(loliSpec: LoliSpec): LoliSpec {
  const semanticValidation = validateLoliSpecSemantically(loliSpec);

  if (!semanticValidation.isValid()) {
    throw new LoliSpecSemanticIssuesError(semanticValidation);
  }

  return loliSpec;
}
