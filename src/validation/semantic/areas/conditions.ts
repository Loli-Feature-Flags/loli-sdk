import type { PropertyCondition } from "../../../schema/conditions/Condition";
import { PropertyConditionTypes } from "../../../schema/conditions/Condition";
import type { LoliSpec } from "../../../schema/LoliSpec";
import { getPropertyFromLoliSpecById } from "../../../utils/entities";
import { getAllConditionsWithPathFromLoliSpec } from "../../../utils/specConditions";
import { SemanticIssue } from "../SemanticIssue";
import { SemanticIssueType } from "../SemanticIssueType";
import { SemanticValidation } from "../SemanticValidation";

/**
 * References all conditions of feature flags and segments semantically.
 * This includes:
 *  - property conditions reference existing properties
 *  - segment conditions reference existing segments
 *  - property conditions reference properties of the correct type
 *
 * @param loliSpec LoliSpec to validate conditions of.
 * @returns Validation with either no issues or issues.
 */
export function validateLoliSpecConditionsSemantically(
  loliSpec: LoliSpec,
): SemanticValidation {
  const validation = new SemanticValidation();

  // Computed here because it's shared by multiple sub validation methods
  const specConditionsWithPath = getAllConditionsWithPathFromLoliSpec(loliSpec);

  validateSegmentConditions(loliSpec, validation, specConditionsWithPath);

  validatePropertyConditions(loliSpec, validation, specConditionsWithPath);

  return validation;
}

/**
 * Validates that all segment conditions within the LoliSpec
 * reference existing segments.
 *
 * @param loliSpec LoliSpec to check conditions of.
 * @param validation Validation to add issues to.
 * @param specConditionsWithPath All conditions.
 */
function validateSegmentConditions(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
  specConditionsWithPath: ReturnType<
    typeof getAllConditionsWithPathFromLoliSpec
  >,
) {
  const existingSegmentIds = loliSpec.segments.map((segment) => segment.id);

  for (const { condition, path } of specConditionsWithPath) {
    if (
      condition.type === "segment" &&
      !existingSegmentIds.includes(condition.segmentId)
    ) {
      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.NON_EXISTING_SEGMENT_REFERENCED,
          path,
          `Condition references a segment with ID "${condition.segmentId}", but such a segment does not exist in the spec.`,
        ),
      );
    }
  }

  return validation;
}

/**
 * Validates that all property conditions within the LoliSpec
 * reference existing properties and properties of the correct data type.
 *
 * @param loliSpec LoliSpec to check conditions of.
 * @param validation Validation to add issues to.
 * @param specConditionsWithPath All conditions.
 */
function validatePropertyConditions(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
  specConditionsWithPath: ReturnType<
    typeof getAllConditionsWithPathFromLoliSpec
  >,
) {
  for (const { condition, path } of specConditionsWithPath) {
    if (PropertyConditionTypes.includes(condition.type)) {
      const propertyCondition = condition as PropertyCondition;
      const property = getPropertyFromLoliSpecById(
        loliSpec,
        propertyCondition.propertyId,
      );

      if (!property) {
        validation.addIssue(
          new SemanticIssue(
            SemanticIssueType.NON_EXISTING_PROPERTY_REFERENCED,
            path,
            `Condition references a property with ID "${(condition as PropertyCondition).propertyId}", but such a property does not exist in the spec.`,
          ),
        );
      } else if (propertyCondition.type !== property.type) {
        validation.addIssue(
          new SemanticIssue(
            SemanticIssueType.CONDITION_PROPERTY_DATA_TYPE_MISMATCH,
            path,
            `The condition is meant for a property of type "${propertyCondition.type}", but property had type "${property.type}".`,
          ),
        );
      }
    }
  }
}
