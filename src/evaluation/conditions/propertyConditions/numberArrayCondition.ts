import type { NumberArrayCondition } from "../../../schema/conditions/NumberArrayCondition";
import { createPropertyConditionEvaluator } from "./base/evaluator";
import { evaluateWithOperandsQuantifier } from "./base/quantifiers/operands";
import { evaluateForArrayProperties } from "./base/quantifiers/propertyArray";
import { evaluateNumberValueOperatorAndOperand } from "./base/values/number";

/**
 * Evaluates the given number array condition by extracting
 * the values (array elements) of the referenced property from the given
 * evaluation context and applying the condition operator and operands
 * to the extracted values based on the condition's property array quantifier
 * and operands quantifier.
 *
 * In the following cases the method will always return false:
 *  - property referenced by the condition is not present in the given spec
 *  - property definition in the spec has a type different from "numberArray"
 *  - property value is not present in the given evaluation context
 *  - property value extracted from the given evaluation context is not a number array
 *
 * @param condition Condition to evaluate.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @Returns True if the values evaluate to true based on the condition's operator, operands, property array quantifier, and operands quantifier. False otherwise.
 */
export const evaluateNumberArrayCondition =
  createPropertyConditionEvaluator<NumberArrayCondition>((condition, array) => {
    return evaluateForArrayProperties<NumberArrayCondition>(
      condition,
      array,
      (value, operator) => {
        return evaluateWithOperandsQuantifier<NumberArrayCondition>(
          condition,
          (operand) => {
            return evaluateNumberValueOperatorAndOperand(
              value,
              operator,
              operand,
            );
          },
        );
      },
    );
  });
