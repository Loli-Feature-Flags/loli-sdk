import type { BooleanArrayCondition } from "../../../../../schema/conditions/BooleanArrayCondition";
import type { BooleanCondition } from "../../../../../schema/conditions/BooleanCondition";
import type { PropertyCondition } from "../../../../../schema/conditions/Condition";

/**
 * This function consistently handles evaluation based on
 * condition operands. You simply supply the condition and
 * an evaluation function. The latter is provided with the
 * operand parameter that can be used for the real evaluation logic.
 *
 * This function under the hood either checks all/some/not all/etc.
 * operands based on the condition's operandsQuantifier and the
 * results of the evaluation function.
 *
 * If the operands array is empty, this function will always return false.
 *
 * @param condition Condition to iterate over operands based on the operandsQuantifier.
 * @param evaluate Evaluate function that gets the operand to be used for single operand evaluation.
 * @returns Returns true, if there is at least one operand and in case the condition evaluates to true based on the given evaluate function, the condition's operands and operandsQuantifier. False otherwise.
 */
export function evaluateWithOperandsQuantifier<
  CONDITION extends Exclude<
    PropertyCondition,
    BooleanCondition | BooleanArrayCondition
  >,
>(
  condition: CONDITION,
  evaluate: (operand: CONDITION["operands"][number]) => boolean,
): boolean {
  if (condition.operands.length === 0) {
    return false;
  }

  switch (condition.operandsQuantifier) {
    case "some":
      return condition.operands.some((operand) => evaluate(operand));
    case "every":
      return condition.operands.every((operand) => evaluate(operand));
    case "notAny":
      return !condition.operands.some((operand) => evaluate(operand));
    case "notEvery":
      return !condition.operands.every((operand) => evaluate(operand));
  }
}
