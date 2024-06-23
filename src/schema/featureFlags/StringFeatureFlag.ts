import { z } from "zod";

import { BaseFeatureFlagSchema } from "./BaseFeatureFlag";
import { StringFeatureFlagRuleSchema } from "./rules/StringFeatureFlagRule";

export const StringFeatureFlagSchema = BaseFeatureFlagSchema.extend({
  type: z.literal("string"),
  targeting: z.object({
    enabled: z.boolean(),
    rules: z.array(StringFeatureFlagRuleSchema),
  }),
  defaultValue: z.string(),
});

export type StringFeatureFlag = z.infer<typeof StringFeatureFlagSchema>;
