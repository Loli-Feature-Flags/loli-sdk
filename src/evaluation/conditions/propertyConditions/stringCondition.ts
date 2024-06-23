import type { StringCondition } from "../../../schema/conditions/StringCondition";
import { createPropertyConditionEvaluator } from "./base/evaluator";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateStringValueOperatorAndOperand } from "./base/values/string";

/**
 * Evaluates the given string condition by extracting
 * the value of the referenced property from the given
 * evaluation context and applying the condition operator
 * and condition's operandsQuantifier to the extracted value
 * and operands.
 *
 * In the following cases the method will always return false:
 *  - property referenced by the condition is not present in the given spec
 *  - property definition in the spec has a type different from "string"
 *  - property value is not present in the given evaluation context
 *  - property value extracted from the given evaluation context is not a string
 *
 * @param condition Condition to evaluate.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @Returns True if the value evaluates to true based on the condition's operator, operands and operandsQuantifier. False otherwise.
 */
export const evaluateStringCondition =
  createPropertyConditionEvaluator<StringCondition>((condition, value) => {
    return evaluateWithOperandsQuantifier<StringCondition>(
      condition,
      (operand) => {
        return evaluateStringValueOperatorAndOperand(
          value,
          condition.operator,
          operand,
        );
      },
    );
  });
