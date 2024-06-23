import { z } from "zod";

import { ConditionSetSchema } from "../conditionSet/ConditionSet";
import { BaseConditionSchema } from "./BaseCondition";

export const ConditionSetConditionSchema = BaseConditionSchema.extend({
  type: z.literal("conditionSet"),
  conditionSet: z.lazy(() => ConditionSetSchema),
});

export type ConditionSetCondition = z.infer<typeof ConditionSetConditionSchema>;
