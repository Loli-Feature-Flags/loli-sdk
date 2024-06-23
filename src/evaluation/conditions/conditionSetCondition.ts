import type { ConditionSetCondition } from "../../schema/conditions/ConditionSetCondition";
import type { LoliSpec } from "../../schema/LoliSpec";
import { evaluateConditionSet } from "../conditionSet";
import type { EvaluationContext } from "../EvaluationContext";
import type { EvaluationMetadata } from "../EvaluationMetadata";

/**
 * Evaluates the given conditionSet condition by
 * calling {@link evaluateConditionSet} with the conditionSet
 * of the condition.
 *
 * @param condition ConditionSet condition to be evaluated.
 * @param loliSpec LoliSpec used to extract information about conditions throughout the whole evaluation.
 * @param evaluationContext EvaluationContext used to extract property condition values throughout the whole evaluation.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 * @returns Returns result of {@link evaluateConditionSet}.
 */
export function evaluateConditionSetCondition(
  condition: ConditionSetCondition,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  return evaluateConditionSet(
    condition.conditionSet,
    loliSpec,
    evaluationContext,
    evaluationMetadata,
  );
}
