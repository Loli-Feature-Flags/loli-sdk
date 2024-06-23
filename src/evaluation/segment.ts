import type { LoliSpec } from "../schema/LoliSpec";
import type { Segment } from "../schema/segment/Segment";
import { evaluateConditionSet } from "./conditionSet";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";

/**
 * Evaluates the given segment by evaluating its conditionSet.
 * Therefore, the method {@link evaluateConditionSet} is used.
 *
 * @param segment Segment to be evaluated.
 * @param loliSpec LoliSpec used to extract information about conditions throughout the whole evaluation.
 * @param evaluationContext EvaluationContext used to extract property condition values throughout the whole evaluation.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 * @returns Returns evaluation result of {@link evaluateConditionSet}.
 */
export function evaluateSegment(
  segment: Segment,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  return evaluateConditionSet(
    segment.conditionSet,
    loliSpec,
    evaluationContext,
    evaluationMetadata,
  );
}
