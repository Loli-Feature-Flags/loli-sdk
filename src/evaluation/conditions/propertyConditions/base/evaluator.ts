import type { PropertyCondition } from "../../../../schema/conditions/Condition";
import type { LoliSpec } from "../../../../schema/LoliSpec";
import type { PropertyDataType } from "../../../../schema/Property";
import { getPropertyFromLoliSpecById } from "../../../../utils/entities";
import { getEvaluationContextValueByPath } from "../../../../utils/evaluationContext";
import { formatPath } from "../../../../utils/path";
import type { EvaluationContext } from "../../../EvaluationContext";
import type { EvaluationMetadata } from "../../../EvaluationMetadata";

/**
 * Creates/returns a function used to evaluate property conditions.
 * The returned function takes care of extracting the property value
 * the condition references via "propertyId" from the given evaluation context.
 *
 * The function passes valid values to the given evaluateConditionForValue
 * function.
 *
 * This function returns always false in the following cases:
 *  - if the property the condition references is not known in the LoliSpec
 *  - if the property the condition references has a different data type than the condition
 *  - if the property exists, but there is no value in the evaluationContext for the property's path
 *  - if the property exists, there is a value in the evaluationContext, but the value has the incorrect data type
 *
 * If the property exists, a value with correct data type is found in the evaluationContext,
 * this value is passed on to the given evaluateConditionForValue along with the condition to
 * be further evaluated (e.g. based on quantifiers and operators).
 *
 * If the warningLogger is specified in the evaluationMetadata that the returned function receives,
 * the returned function will log the following warnings:
 *  - if the property was not found in the evaluation context: warning type = property-value-not-found
 *  - if the property found in the evaluation context but has an incorrect data type: warning type = property-value-incorrect-data-type
 *
 * @param evaluateConditionForValue Function that evaluates a valid value from the evaluationContext for the condition this function receives too.
 * @returns Returns false for invalid cases (see function body docs) or the result of the given evaluateConditionForValue function.
 *
 */
export function createPropertyConditionEvaluator<
  CONDITION extends PropertyCondition,
>(
  evaluateConditionForValue: (
    condition: CONDITION,
    value: PropertyDataType<CONDITION["type"]>,
  ) => boolean,
): (
  condition: CONDITION,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
) => boolean {
  return function (condition, loliSpec, evaluationContext, evaluationMetadata) {
    const property = getPropertyFromLoliSpecById(
      loliSpec,
      condition.propertyId,
    );

    if (!property || property.type !== condition.type) {
      return false;
    }

    const { value, found, correctDataType } = getEvaluationContextValueByPath<
      CONDITION["type"]
    >(property.path, evaluationContext, property.type);

    if (value === undefined) {
      if (!found) {
        evaluationMetadata.warningLogger?.(
          "property-value-not-found",
          `No value was found for the property "${property.name}" (ID = ${property.id}, path = ${formatPath(property.path)}).`,
        );
      } else if (!correctDataType) {
        evaluationMetadata.warningLogger?.(
          "property-value-incorrect-data-type",
          `The property "${property.name}" was found, but was not of the expected property type "${property.type}" (ID = ${property.id}, path = ${formatPath(property.path)}).`,
        );
      }

      return false;
    }

    return evaluateConditionForValue(condition, value);
  };
}
