import type { ConditionSet } from "../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../schema/LoliSpec";
import { evaluateCondition } from "./conditions/condition";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";

/**
 * Evaluates the given conditionSet based on the conditionSet's operator
 * and the array of conditions.
 *
 * Returns always false, if the condition set has no conditions.
 *
 * The operators are applied the following way (pseudo-code):
 *  - `or`: `conditions.some(evaluate(condition) === true)`
 *  - `and`: `conditions.every(evaluate(condition) === true)`
 *  - `nor`: `!conditions.some(evaluate(condition) === true)`
 *  - `nand`: `!conditions.every(evaluate(condition) === true)`
 *
 * Uses the method {@link evaluateCondition} under the hood to evaluate the
 * conditions of the conditionSet's conditions array.
 *
 * @param conditionSet ConditionSet to be evaluated.
 * @param loliSpec LoliSpec used to extract information about conditions throughout the whole evaluation.
 * @param evaluationContext EvaluationContext used to extract property condition values throughout the whole evaluation.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation.
 * @returns Returns true, if the conditions of the conditionSet evaluate to true according to the conditionSet's operator and the result of the evaluateCondition calls. False otherwise.
 */
export function evaluateConditionSet(
  conditionSet: ConditionSet,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): boolean {
  const { operator, conditions } = conditionSet;

  if (conditions.length === 0) {
    return false;
  }

  switch (operator) {
    case "or":
      return conditions.some((condition) =>
        evaluateCondition(
          condition,
          loliSpec,
          evaluationContext,
          evaluationMetadata,
        ),
      );
    case "and":
      return conditions.every((condition) =>
        evaluateCondition(
          condition,
          loliSpec,
          evaluationContext,
          evaluationMetadata,
        ),
      );
    case "nor":
      return !conditions.some((condition) =>
        evaluateCondition(
          condition,
          loliSpec,
          evaluationContext,
          evaluationMetadata,
        ),
      );
    case "nand":
      return !conditions.every((condition) =>
        evaluateCondition(
          condition,
          loliSpec,
          evaluationContext,
          evaluationMetadata,
        ),
      );
  }
}
