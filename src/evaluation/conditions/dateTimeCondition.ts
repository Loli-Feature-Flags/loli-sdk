import type { DateTimeCondition } from "../../schema/conditions/DateTimeCondition";
import { dateTimeConditionOperandToDate } from "../../utils/conditions/datetime";
import type { EvaluationMetadata } from "../EvaluationMetadata";

/**
 * Evaluates the given date time condition.
 * Therefor, the current date/time is taken
 * and the operand date/time is taken from with the
 * correct timezone mode (based on condition's timezoneOffsetMode).
 *
 * Based on the condition's operator, the following is done (pseudo-code):
 *  - `equalsOrIsAfter`: `now.getTime() >= operand.getTime()`
 *  - `isBefore`: `now.getTime() < operand.getTime()`
 *
 * @param condition Date time condition to be evaluated based on date/time when this function is called.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 */
export function evaluateDateTimeCondition(
  condition: DateTimeCondition,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  const operandDateTime = dateTimeConditionOperandToDate(
    condition.operand,
    condition.timezoneOffsetMode,
  );

  switch (condition.operator) {
    case "equalsOrIsAfter":
      return (
        evaluationMetadata.evaluationDateTime.getTime() >=
        operandDateTime.getTime()
      );
    case "isBefore":
      return (
        evaluationMetadata.evaluationDateTime.getTime() <
        operandDateTime.getTime()
      );
  }
}
