import { z } from "zod";

import { BaseConditionSchema } from "./BaseCondition";

export const AlwaysTrueConditionSchema = BaseConditionSchema.extend({
  type: z.literal("alwaysTrue"),
});

export type AlwaysTrueCondition = z.infer<typeof AlwaysTrueConditionSchema>;
