import { z } from "zod";

import { BaseFeatureFlagRuleSchema } from "./BaseFeatureFlagRule";
import { RolloutPercentageSchema } from "./RolloutPercentage";

export const NumberFeatureFlagRuleSchema = BaseFeatureFlagRuleSchema.extend({
  valuesOnMatch: z
    .array(
      z.object({
        value: z.number(),
        rolloutPercentage: RolloutPercentageSchema,
      }),
    )
    .min(1),
});

export type NumberFeatureFlagRule = z.infer<typeof NumberFeatureFlagRuleSchema>;
