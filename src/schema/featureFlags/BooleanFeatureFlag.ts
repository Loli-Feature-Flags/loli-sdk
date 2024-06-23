import { z } from "zod";

import { BaseFeatureFlagSchema } from "./BaseFeatureFlag";
import { BooleanFeatureFlagRule } from "./rules/BooleanFeatureFlagRule";

export const BooleanFeatureFlagSchema = BaseFeatureFlagSchema.extend({
  type: z.literal("boolean"),
  targeting: z.object({
    enabled: z.boolean(),
    rules: z.array(BooleanFeatureFlagRule),
  }),
  defaultValue: z.boolean(),
});

export type BooleanFeatureFlag = z.infer<typeof BooleanFeatureFlagSchema>;
