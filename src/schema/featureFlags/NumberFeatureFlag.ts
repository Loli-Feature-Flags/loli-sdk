import { z } from "zod";

import { BaseFeatureFlagSchema } from "./BaseFeatureFlag";
import { NumberFeatureFlagRuleSchema } from "./rules/NumberFeatureFlagRule";

export const NumberFeatureFlagSchema = BaseFeatureFlagSchema.extend({
  type: z.literal("number"),
  targeting: z.object({
    enabled: z.boolean(),
    rules: z.array(NumberFeatureFlagRuleSchema),
  }),
  defaultValue: z.number(),
});

export type NumberFeatureFlag = z.infer<typeof NumberFeatureFlagSchema>;
