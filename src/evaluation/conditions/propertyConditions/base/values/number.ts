import type { NumberArrayCondition } from "../../../../../schema/conditions/NumberArrayCondition";
import type { NumberCondition } from "../../../../../schema/conditions/NumberCondition";
import type { OperatorWithoutArrayOperators } from "../types";

/**
 * Evaluates if the given number value based on the given
 * operator/against the given operand.
 *
 * @param value Number value to be evaluated.
 * @param operator Operator to applied/used for evaluation.
 * @param operand Operand value used to compare/evaluate value against.
 * @returns Returns true of the evaluation is true according to the given operator and operand, false otherwise.
 */
export function evaluateNumberValueOperatorAndOperand(
  value: number,
  operator:
    | OperatorWithoutArrayOperators<NumberCondition>
    | OperatorWithoutArrayOperators<NumberArrayCondition>,
  operand: number,
) {
  switch (operator) {
    case "equals":
      return value === operand;
    case "doesNotEqual":
      return value !== operand;
    case "isLessThan":
      return value < operand;
    case "isLessThanEquals":
      return value <= operand;
    case "isGreaterThan":
      return value > operand;
    case "isGreaterThanEquals":
      return value >= operand;
    case "isEven":
      return Math.abs(value) % 2 === 0;
    case "isOdd":
      return Math.abs(value) % 2 === 1;
  }
}
