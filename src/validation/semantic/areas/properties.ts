import type { LoliSpec } from "../../../schema/LoliSpec";
import type { Property } from "../../../schema/Property";
import type { Path } from "../../../types/Path";
import { SemanticIssue } from "../SemanticIssue";
import { SemanticIssueType } from "../SemanticIssueType";
import { SemanticValidation } from "../SemanticValidation";

/**
 * Validates properties semantically. This includes:
 *  - All properties have unique path arrays.
 *
 * @param loliSpec LoliSpec to check properties of.
 */
export function validateLoliSpecPropertiesSemantically(
  loliSpec: LoliSpec,
): SemanticValidation {
  const validation = new SemanticValidation();

  validatePropertiesHaveUniquePaths(loliSpec, validation);

  return validation;
}

/**
 * Validates if all evaluation context properties have unique path arrays.
 * If the method finds two or more properties sharing the same
 * path array, this method creates adds an issue for each corresponding
 * property.
 *
 * @param loliSpec LoliSpec to check properties of.
 * @param validation Validation to add issues to.
 */
function validatePropertiesHaveUniquePaths(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
) {
  // We map a string (the stringified property path) to an array of all properties that have that path
  // (each array record holds the spec path and the property object).
  const pathPropertyMap: Map<string, { path: Path; property: Property }[]> =
    new Map();

  for (
    let propertyIndex = 0;
    propertyIndex < loliSpec.evaluationContext.properties.length;
    propertyIndex++
  ) {
    const property = loliSpec.evaluationContext.properties[propertyIndex];

    const specPath = ["evaluationContext", "properties", propertyIndex];
    const stringifiedPropertyPath = JSON.stringify(property.path);

    let array = pathPropertyMap.get(stringifiedPropertyPath);

    if (!array) {
      array = [];
      pathPropertyMap.set(stringifiedPropertyPath, array);
    }

    array.push({ path: specPath, property });
  }

  // Now we can check if there are properties that have the same path.
  for (const [stringifedPath, entries] of pathPropertyMap.entries()) {
    if (entries.length > 1) {
      for (const { property, path } of entries) {
        validation.addIssue(
          new SemanticIssue(
            SemanticIssueType.DUPLICATED_PROPERTY_PATH,
            path,
            `Property "${property.name}" (ID = "${property.id}") has the non-unique path: ${stringifedPath}`,
          ),
        );
      }
    }
  }
}
