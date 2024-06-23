import type { SegmentCondition } from "../../schema/conditions/SegmentCondition";
import type { LoliSpec } from "../../schema/LoliSpec";
import { getSegmentFromLoliSpecById } from "../../utils/entities";
import type { EvaluationContext } from "../EvaluationContext";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { evaluateSegment } from "../segment";

/**
 * Evaluates a segment condition by first extracting
 * the segment from the given LoliSpec by the segmentId
 * the condition referenced. Therefor, {@link getSegmentFromLoliSpecById} is used.
 *
 * The extracted segment is evaluated by calling
 * the function {@link evaluateSegment}. Its result is then returned.
 *
 * In case the segment could not be found in the given LoliSpec, false is returned.
 *
 * @param condition Segment condition to be evaluated.
 * @param loliSpec LoliSpec used to extract information about conditions throughout the whole evaluation.
 * @param evaluationContext EvaluationContext used to extract property condition values throughout the whole evaluation.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 * @returns Returns true if segment exists and {@link evaluateSegment} returns true, false otherwise.
 */
export function evaluateSegmentCondition(
  condition: SegmentCondition,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  const segment = getSegmentFromLoliSpecById(loliSpec, condition.segmentId);

  if (!segment) {
    return false;
  }

  const segmentEvaluation = evaluateSegment(
    segment,
    loliSpec,
    evaluationContext,
    evaluationMetadata,
  );

  switch (condition.operator) {
    case "isTrue":
      return segmentEvaluation;
    case "isFalse":
      return !segmentEvaluation;
  }
}
