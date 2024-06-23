import { z } from "zod";

import { ConditionSetSchema } from "../../conditionSet/ConditionSet";

export const BaseFeatureFlagRuleSchema = z.object({
  enabled: z.boolean(),
  conditionSet: ConditionSetSchema,
});
