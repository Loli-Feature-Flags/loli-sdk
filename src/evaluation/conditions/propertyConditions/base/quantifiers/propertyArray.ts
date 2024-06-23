import type { PropertyArrayCondition } from "../../../../../schema/conditions/Condition";
import type {
  ArrayPropertyDataType,
  ArrayPropertyElementDataType,
} from "../../../../../schema/Property";
import type { OperatorWithoutArrayOperators } from "../types";

/**
 * This function helps to evaluate conditions acting on array properties.
 * You have to pass the condition, the array representing the values of
 * the property the condition is acting on and an evaluate function.
 *
 * This function does two things:
 *  - (1) check if the condition operator is hasElements or hasNoElements
 *  - (2) for all other operators, if array is empty or not
 *  - (3) if (1) and (2) do not apply, evaluate condition based on condition's propertyArrayQuantifier.
 *
 * In case of (1), the functions returns
 *  - for the operator hasElements
 *    - true, if the given array has at least one element,
 *    - false, if empty
 *  - for the operator hasNoElements
 *    - true, if the given array is empty
 *    - false, if not empty
 *
 * In case of (2), the function returns false for an empty array.
 * If the array is not empty it goes on with (3).
 *
 * In case of (3), the function evaluate the condition and the array values
 * based on the condition's propertyArrayQuantifier and using the given evaluate
 * function. This function is guaranteed to neither be called with the operator
 * "hasElements" nor "hasNoElements".
 *
 * @param condition Condition to be evaluated.
 * @param array Array representing the value/values of the property the condition is referencing.
 * @param evaluate Evaluate function to evaluate single values from the property value array.
 * @returns Returns true if the condition evaluates to true, false otherwise. Check main function docs for details.
 */
export function evaluateForArrayProperties<
  CONDITION extends PropertyArrayCondition,
>(
  condition: CONDITION,
  array: ArrayPropertyDataType<CONDITION["type"]>,
  evaluate: (
    value: ArrayPropertyElementDataType<CONDITION["type"]>,
    operator: OperatorWithoutArrayOperators<CONDITION>,
  ) => boolean,
): boolean {
  switch (condition.operator) {
    case "hasElements":
      return array.length > 0;
    case "hasNoElements":
      return array.length === 0;
  }

  if (array.length === 0) {
    return false;
  }

  switch (condition.propertyArrayQuantifier) {
    case "some":
      return array.some((value) =>
        evaluate(
          value,
          condition.operator as OperatorWithoutArrayOperators<CONDITION>,
        ),
      );
    case "every":
      return array.every((value) =>
        evaluate(
          value,
          condition.operator as OperatorWithoutArrayOperators<CONDITION>,
        ),
      );
    case "notAny":
      return !array.some((value) =>
        evaluate(
          value,
          condition.operator as OperatorWithoutArrayOperators<CONDITION>,
        ),
      );
    case "notEvery":
      return !array.every((value) =>
        evaluate(
          value,
          condition.operator as OperatorWithoutArrayOperators<CONDITION>,
        ),
      );
  }
}
