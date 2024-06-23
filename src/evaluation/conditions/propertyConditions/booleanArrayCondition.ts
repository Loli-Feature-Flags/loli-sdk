import type { BooleanArrayCondition } from "../../../schema/conditions/BooleanArrayCondition";
import { createPropertyConditionEvaluator } from "./base/evaluator";
import { evaluateForArrayProperties } from "./base/quantifiers/propertyArray";
import { evaluateBooleanValueAndOperator } from "./base/values/boolean";

/**
 * Evaluates the given boolean array condition by extracting
 * the values (array elements) of the referenced property from the given
 * evaluation context and applying the condition operator
 * to the extracted values based on the condition's property array quantifier.
 *
 * In the following cases the method will always return false:
 *  - property referenced by the condition is not present in the given spec
 *  - property definition in the spec has a type different from "booleanArray"
 *  - property value is not present in the given evaluation context
 *  - property value extracted from the given evaluation context is not a boolean array
 *
 * @param condition Condition to evaluate.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @Returns True if the values evaluate to true based on the condition's operator and property array quantifier. False otherwise.
 */
export const evaluateBooleanArrayCondition =
  createPropertyConditionEvaluator<BooleanArrayCondition>(
    (condition, array) => {
      return evaluateForArrayProperties<BooleanArrayCondition>(
        condition,
        array,
        (value, operator) => {
          return evaluateBooleanValueAndOperator(value, operator);
        },
      );
    },
  );
