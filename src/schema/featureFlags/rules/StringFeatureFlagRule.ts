import { z } from "zod";

import { BaseFeatureFlagRuleSchema } from "./BaseFeatureFlagRule";
import { RolloutPercentageSchema } from "./RolloutPercentage";

export const StringFeatureFlagRuleSchema = BaseFeatureFlagRuleSchema.extend({
  valuesOnMatch: z
    .array(
      z.object({
        value: z.string(),
        rolloutPercentage: RolloutPercentageSchema,
      }),
    )
    .min(1),
});

export type StringFeatureFlagRule = z.infer<typeof StringFeatureFlagRuleSchema>;
