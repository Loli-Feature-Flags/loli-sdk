import type { PropertyCondition } from "../../../schema/conditions/Condition";
import type { LoliSpec } from "../../../schema/LoliSpec";
import type { EvaluationContext } from "../../EvaluationContext";
import type { EvaluationMetadata } from "../../EvaluationMetadata";
import { evaluateBooleanArrayCondition } from "./booleanArrayCondition";
import { evaluateBooleanCondition } from "./booleanCondition";
import { evaluateNumberArrayCondition } from "./numberArrayCondition";
import { evaluateNumberCondition } from "./numberCondition";
import { evaluateStringArrayCondition } from "./stringArrayCondition";
import { evaluateStringCondition } from "./stringCondition";

/**
 * Based on the condition type the correct
 * condition evaluator function for the corresponding property condition type
 * is executed and its result will be returned.
 *
 * For the following condition types the following methods are called:
 *  - booleanArray: evaluateBooleanArrayCondition
 *  - boolean: evaluateBooleanCondition
 *  - numberArray: evaluateNumberArrayCondition
 *  - number: evaluateNumberCondition
 *  - stringArray: evaluateStringArrayCondition
 *  - string: evaluateStringCondition
 *
 * @param condition Property condition to be evaluated.
 * @param loliSpec LoliSpec used to extract the property definition from.
 * @param evaluationContext Evaluation context object used to extract property value from.
 * @param evaluationMetadata Evaluation metadata.
 * @returns Returns evaluation result of concrete evaluation functions.
 */
export function evaluatePropertyCondition(
  condition: PropertyCondition,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  switch (condition.type) {
    case "booleanArray":
      return evaluateBooleanArrayCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "boolean":
      return evaluateBooleanCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "numberArray":
      return evaluateNumberArrayCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "number":
      return evaluateNumberCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "stringArray":
      return evaluateStringArrayCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "string":
      return evaluateStringCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
  }
}
