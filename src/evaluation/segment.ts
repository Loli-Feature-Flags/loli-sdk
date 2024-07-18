import type { LoliSpec } from "../schema/LoliSpec";
import type { Segment } from "../schema/segment/Segment";
import { evaluateConditionSet } from "./conditionSet";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";

/**
 * If the segmentEvaluationCache of the passed {@link EvaluationMetadata}
 * already contains an evaluation for the segment (by segment ID as key),
 * then the cached evaluation is returned.
 *
 * Otherwise, evaluates the given segment by evaluating its conditionSet.
 * Therefore, the method {@link evaluateConditionSet} is used. This
 * computed evaluation is then stored in the segmentEvaluationCache of
 * the passed {@link EvaluationMetadata}.
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
  if (evaluationMetadata.segmentEvaluationCache) {
    const cachedEvaluation = evaluationMetadata.segmentEvaluationCache.get(
      segment.id,
    );

    if (typeof cachedEvaluation === "boolean") {
      return cachedEvaluation;
    }
  }

  const evaluation = evaluateConditionSet(
    segment.conditionSet,
    loliSpec,
    evaluationContext,
    evaluationMetadata,
  );

  if (evaluationMetadata.segmentEvaluationCache) {
    evaluationMetadata.segmentEvaluationCache.set(segment.id, evaluation);
  }

  return evaluation;
}
