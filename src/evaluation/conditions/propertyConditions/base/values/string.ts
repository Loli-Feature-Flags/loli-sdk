import type { StringArrayCondition } from "../../../../../schema/conditions/StringArrayCondition";
import type { StringCondition } from "../../../../../schema/conditions/StringCondition";
import type { OperatorWithoutArrayOperators } from "../types";

/**
 * Evaluates if the given string value based on the given
 * operator/against the given operand.
 *
 * @param value String value to be evaluated.
 * @param operator Operator to applied/used for evaluation.
 * @param operand Operand value used to compare/evaluate value against.
 * @returns Returns true of the evaluation is true according to the given operator and operand, false otherwise.
 */
export function evaluateStringValueOperatorAndOperand(
  value: string,
  operator:
    | OperatorWithoutArrayOperators<StringCondition>
    | OperatorWithoutArrayOperators<StringArrayCondition>,
  operand: string,
) {
  switch (operator) {
    case "equals":
      return value === operand;
    case "doesNotEqual":
      return value !== operand;
    case "startsWith":
      return value.startsWith(operand);
    case "doesNotStartWith":
      return !value.startsWith(operand);
    case "endsWith":
      return value.endsWith(operand);
    case "doesNotEndWith":
      return !value.endsWith(operand);
    case "matchesRegex":
      try {
        return new RegExp(operand).test(value);
      } catch (error) {
        return false;
      }
    case "doesNotMatchRegex":
      try {
        return !new RegExp(operand).test(value);
      } catch (error) {
        return true;
      }
    case "isBlank":
      return value.trim().length === 0;
    case "isNotBlank":
      return value.trim().length > 0;
  }
}
