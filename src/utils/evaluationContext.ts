import type { EvaluationContext } from "../evaluation/EvaluationContext";
import type { PropertyDataType, PropertyType } from "../schema/Property";

/**
 * Extracts an evaluation context value denoted by the
 * given path from the given evaluation context.
 *
 * Checks as well, that the type of the value
 * denoted by the given path matches the given expected type.
 *
 * @param path Path denoting where to extract the value from.
 * @param evaluationContext Evaluation context object to extract value from.
 * @param type Expected type of value denoted by path.
 * @returns Returns value matching the given type. Returns undefined either if the value's type does not match the given expected type or if the value denoted by the path does not exist.
 */
export function getEvaluationContextValueByPath<
  T extends PropertyType,
  R = PropertyDataType<T>,
>(
  path: string[],
  evaluationContext: EvaluationContext,
  type: T,
):
  | { value: R; found: true; correctDataType: true }
  | { value: undefined; found: false; correctDataType: false }
  | { value: undefined; found: true; correctDataType: false } {
  let pointer: EvaluationContext = evaluationContext;

  for (
    let pathSegmentIndex = 0;
    pathSegmentIndex < path.length;
    pathSegmentIndex++
  ) {
    const pathSegment = path[pathSegmentIndex];
    const isLastPathSegment = pathSegmentIndex === path.length - 1;

    const value =
      typeof pathSegment === "string" &&
      pointer !== null &&
      typeof pointer === "object"
        ? pointer[pathSegment]
        : undefined;

    if (isLastPathSegment) {
      if (
        (type === "string" && typeof value === "string") ||
        (type === "number" && typeof value === "number") ||
        (type === "boolean" && typeof value === "boolean") ||
        (Array.isArray(value) &&
          ((type === "stringArray" &&
            value.every((element) => typeof element === "string")) ||
            (type === "numberArray" &&
              value.every((element) => typeof element === "number")) ||
            (type === "booleanArray" &&
              value.every((element) => typeof element === "boolean"))))
      ) {
        return {
          value: value as R,
          found: true,
          correctDataType: true,
        };
      } else if (value !== undefined && value !== null) {
        return {
          value: undefined,
          found: true,
          correctDataType: false,
        };
      }
    } else if (
      value !== null &&
      !Array.isArray(value) &&
      typeof value === "object"
    ) {
      pointer = value;
    } else {
      return {
        value: undefined,
        found: false,
        correctDataType: false,
      };
    }
  }

  return {
    value: undefined,
    found: false,
    correctDataType: false,
  };
}
