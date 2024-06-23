import type { BooleanCondition } from "../../../schema/conditions/BooleanCondition";
import { createPropertyConditionEvaluator } from "./base/evaluator";
import { evaluateBooleanValueAndOperator } from "./base/values/boolean";

/**
 * Evaluates the given boolean condition by extracting
 * the value of the referenced property from the given
 * evaluation context and applying the condition operator
 * to the extracted value.
 *
 * In the following cases the method will always return false:
 *  - property referenced by the condition is not present in the given spec
 *  - property definition in the spec has a type different from "boolean"
 *  - property value is not present in the given evaluation context
 *  - property value extracted from the given evaluation context is not a boolean
 *
 * @param condition Condition to evaluate.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @Returns True if the value evaluates to true based on the condition's operator. False otherwise.
 */
export const evaluateBooleanCondition =
  createPropertyConditionEvaluator<BooleanCondition>((condition, value) => {
    return evaluateBooleanValueAndOperator(value, condition.operator);
  });
