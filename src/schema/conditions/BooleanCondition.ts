import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";

export const BooleanConditionOperators = ["isTrue", "isFalse"] as const;

export type BooleanConditionOperator =
  (typeof BooleanConditionOperators)[number];

export const BooleanConditionSchema = BaseConditionSchema.extend({
  type: z.literal("boolean"),
  propertyId: LoliIdSchema,
  operator: z.enum(BooleanConditionOperators),
});

export type BooleanCondition = z.infer<typeof BooleanConditionSchema>;
