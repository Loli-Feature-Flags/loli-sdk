import type {
  FeatureFlag,
  FeatureFlagOutput,
} from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import { evaluateConditionSet } from "./conditionSet";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";
import { pickValueToBeRolledOut } from "./rollout/pickValue";

/**
 * Evaluates a given feature flag object.
 * @param featureFlag Feature flag to be evaluated.
 * @param loliSpec LoliSpec used throughout the whole evaluation to lookup definitions etc.
 * @param evaluationContext Evaluation context used throughout the whole evaluation to get property values.
 * @param evaluationMetadata Evaluation metadata used throughout the whole evaluation (used for date time conditions and picking values to be rolled out).
 * @returns If targeting is enabled and there is an enabled rule that evaluates to true, a value of the rules valuesOnMatch is returned. Otherwise, the defaultValue of the feature flag is returned.
 */
export function evaluateFeatureFlag<FEATURE_FLAG extends FeatureFlag>(
  featureFlag: FEATURE_FLAG,
  loliSpec: LoliSpec,
  evaluationContext: EvaluationContext,
  evaluationMetadata: EvaluationMetadata,
): FeatureFlagOutput<FEATURE_FLAG> {
  if (featureFlag.targeting.enabled) {
    for (const rule of featureFlag.targeting.rules) {
      if (!rule.enabled) {
        continue;
      }

      const conditionSetResult = evaluateConditionSet(
        rule.conditionSet,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      if (conditionSetResult) {
        return pickValueToBeRolledOut(
          rule,
          evaluationMetadata,
          featureFlag.defaultValue,
        );
      }
    }
  }

  return featureFlag.defaultValue;
}
