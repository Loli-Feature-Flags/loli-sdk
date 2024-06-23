import type { Condition } from "../../schema/conditions/Condition";
import type { LoliSpec } from "../../schema/LoliSpec";
import type { EvaluationContext } from "../EvaluationContext";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { evaluateAlwaysTrueCondition } from "./alwaysTrueCondition";
import { evaluateConditionSetCondition } from "./conditionSetCondition";
import { evaluateDateTimeCondition } from "./dateTimeCondition";
import { evaluatePropertyCondition } from "./propertyConditions/propertyCondition";
import { evaluateSegmentCondition } from "./segmentCondition";

/**
 * Evaluates a condition of an arbitrary type. It delegates
 * the evaluation to concrete condition type evaluation functions.
 *
 * The following methods are called for the corresponding condition types:
 *  - `booleanArray | boolean | numberArray | number | stringArray | string`: {@link evaluatePropertyCondition}
 *  - `alwaysTrue`: {@link evaluateAlwaysTrueCondition}
 *  - `conditionSet`: {@link evaluateConditionSetCondition}
 *  - `dateTime`: {@link evaluateDateTimeCondition}
 *  - `segment`: {@link evaluateSegmentCondition}
 *
 * @param condition Condition to be evaluated.
 * @param loliSpec LoliSpec used to extract information about conditions throughout the whole evaluation.
 * @param evaluationContext EvaluationContext used to extract property condition values throughout the whole evaluation.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 * @returns Returns evaluation result of called condition type evaluation function.
 */
export function evaluateCondition(
  condition: Condition,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  switch (condition.type) {
    case "booleanArray":
    case "boolean":
    case "numberArray":
    case "number":
    case "stringArray":
    case "string":
      return evaluatePropertyCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "alwaysTrue":
      return evaluateAlwaysTrueCondition();
    case "conditionSet":
      return evaluateConditionSetCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    case "dateTime":
      return evaluateDateTimeCondition(condition, evaluationMetadata);
    case "segment":
      return evaluateSegmentCondition(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
  }
}
