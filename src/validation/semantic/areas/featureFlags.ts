import type { FeatureFlag } from "../../../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../../../schema/LoliSpec";
import type { Path } from "../../../types/Path";
import { SemanticIssue } from "../SemanticIssue";
import { SemanticIssueType } from "../SemanticIssueType";
import { SemanticValidation } from "../SemanticValidation";

/**
 * Validates feature flags semantically. This includes:
 *  - Validating that every feature flag has a unique "name".
 *
 * @param loliSpec LoliSpec to validate feature flags of.
 * @return SemanticValidation instance which may has issues.
 */
export function validateLoliSpecFeatureFlagsSemantically(
  loliSpec: LoliSpec,
): SemanticValidation {
  const validation = new SemanticValidation();

  validateUniqueFeatureFlagNames(loliSpec, validation);

  validateFeatureFlagRulesHaveAtLeastOneValueAndOneHundredRolloutPercentageSums(
    loliSpec,
    validation,
  );

  return validation;
}

/**
 * Validates if all feature flags have a unique name.
 * If two or more feature flags share the same name,
 * this method will add an issue for every single of them
 * to the given validation. The issues will be of type
 * SemanticIssueType.DUPLICATED_FEATURE_FLAG_NAME.
 *
 * @param loliSpec LoliSpec to check the feature flags of.
 * @param validation Validation to add issues to.
 */
function validateUniqueFeatureFlagNames(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
) {
  const nameFeatureFlagMap: Map<
    string,
    { path: Path; featureFlag: FeatureFlag }[]
  > = new Map();

  // We first create a map from name <> path/featureFlag entries.
  for (
    let featureFlagIndex = 0;
    featureFlagIndex < loliSpec.featureFlags.length;
    featureFlagIndex++
  ) {
    const featureFlag = loliSpec.featureFlags[featureFlagIndex];
    const path = ["featureFlags", featureFlagIndex];

    let nameArray = nameFeatureFlagMap.get(featureFlag.name);

    if (!nameArray) {
      nameArray = [];
      nameFeatureFlagMap.set(featureFlag.name, nameArray);
    }

    nameArray.push({ path, featureFlag });
  }

  // Now we can check if all name entries only have one featureFlag.
  for (const [name, entries] of nameFeatureFlagMap.entries()) {
    // If there is more than one entry this means,
    // a feature flag name is used multiple times.
    // We create an issue for every single feature flag
    // using that name.
    if (entries.length > 1) {
      for (const { path, featureFlag } of entries) {
        validation.addIssue(
          new SemanticIssue(
            SemanticIssueType.DUPLICATED_FEATURE_FLAG_NAME,
            path,
            `Feature flag with ID "${featureFlag.id}" used non-unique name "${name}".`,
          ),
        );
      }
    }
  }
}

/**
 * Validates that all feature flags have rules with rollout percentages sums
 * of 100%. If not, this method adds an issue for every "valuesOnMatch" array
 * of the corresponding rule/feature flag.
 *
 * @param loliSpec LoliSpec to check all its featureFlags and rule of.
 * @param validation Validation to add issues to.
 */
function validateFeatureFlagRulesHaveAtLeastOneValueAndOneHundredRolloutPercentageSums(
  loliSpec: LoliSpec,
  validation: SemanticValidation,
) {
  for (
    let featureFlagIndex = 0;
    featureFlagIndex < loliSpec.featureFlags.length;
    featureFlagIndex++
  ) {
    const featureFlag = loliSpec.featureFlags[featureFlagIndex];

    for (
      let ruleIndex = 0;
      ruleIndex < featureFlag.targeting.rules.length;
      ruleIndex++
    ) {
      const rule = featureFlag.targeting.rules[ruleIndex];

      const path = [
        "featureFlags",
        featureFlagIndex,
        "targeting",
        "rules",
        ruleIndex,
        "valuesOnMatch",
      ];

      if (rule.valuesOnMatch.length === 0) {
        validation.addIssue(
          new SemanticIssue(
            SemanticIssueType.NO_VALUES_ON_MATCH,
            path,
            `This rule has an empty valuesOnMatch array. There must be at least one valueOnMatch element.`,
          ),
        );
      } else {
        const rolloutPercentageSum = rule.valuesOnMatch.reduce(
          (acc, curr) => acc + curr.rolloutPercentage,
          0,
        );

        if (rolloutPercentageSum !== 100) {
          validation.addIssue(
            new SemanticIssue(
              SemanticIssueType.ROLLOUT_PERCENTAGE_SUM_NOT_ONE_HUNDRED,
              path,
              `The rollout percentages must sum up to 100%, but sum was ${rolloutPercentageSum}%`,
            ),
          );
        }
      }
    }
  }
}
