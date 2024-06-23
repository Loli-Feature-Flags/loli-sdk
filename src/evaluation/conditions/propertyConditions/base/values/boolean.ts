import type { BooleanArrayCondition } from "../../../../../schema/conditions/BooleanArrayCondition";
import type { BooleanCondition } from "../../../../../schema/conditions/BooleanCondition";
import type { OperatorWithoutArrayOperators } from "../types";

/**
 * Evaluates if the given boolean value based on the given
 * operator.
 *
 * @param value Boolean value to be evaluated.
 * @param operator Operator to applied/used for evaluation.
 * @returns Returns true of the evaluation is true according to the given operator, false otherwise.
 */
export function evaluateBooleanValueAndOperator(
  value: boolean,
  operator:
    | OperatorWithoutArrayOperators<BooleanCondition>
    | OperatorWithoutArrayOperators<BooleanArrayCondition>,
) {
  switch (operator) {
    case "isTrue":
      return value === true;
    case "isFalse":
      return value === false;
  }
}
