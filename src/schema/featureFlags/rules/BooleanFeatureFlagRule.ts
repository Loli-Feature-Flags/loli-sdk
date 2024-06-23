import { z } from "zod";

import { BaseFeatureFlagRuleSchema } from "./BaseFeatureFlagRule";
import { RolloutPercentageSchema } from "./RolloutPercentage";

export const BooleanFeatureFlagRule = BaseFeatureFlagRuleSchema.extend({
  valuesOnMatch: z
    .array(
      z.object({
        value: z.boolean(),
        rolloutPercentage: RolloutPercentageSchema,
      }),
    )
    .min(1),
});

export type BooleanFeatureFlagRule = z.infer<typeof BooleanFeatureFlagRule>;
