import type { NumberCondition } from "../../../schema/conditions/NumberCondition";
import { createPropertyConditionEvaluator } from "./base/evaluator";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateNumberValueOperatorAndOperand } from "./base/values/number";

/**
 * Evaluates the given number condition by extracting
 * the value of the referenced property from the given
 * evaluation context and applying the condition operator
 * and condition's operandsQuantifier to the extracted value
 * and operands.
 *
 * In the following cases the method will always return false:
 *  - property referenced by the condition is not present in the given spec
 *  - property definition in the spec has a type different from "number"
 *  - property value is not present in the given evaluation context
 *  - property value extracted from the given evaluation context is not a number
 *
 * @param condition Condition to evaluate.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @Returns True if the value evaluates to true based on the condition's operator, operands and operandsQuantifier. False otherwise.
 */
export const evaluateNumberCondition =
  createPropertyConditionEvaluator<NumberCondition>((condition, value) => {
    return evaluateWithOperandsQuantifier<NumberCondition>(
      condition,
      (operand) => {
        return evaluateNumberValueOperatorAndOperand(
          value,
          condition.operator,
          operand,
        );
      },
    );
  });
