import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";
import { QuantifierSchema } from "./Quantifier";

export const BooleanArrayConditionOperators = [
  "isTrue",
  "isFalse",
  "hasElements",
  "hasNoElements",
] as const;

export type BooleanArrayConditionOperator =
  (typeof BooleanArrayConditionOperators)[number];

export const BooleanArrayConditionSchema = BaseConditionSchema.extend({
  type: z.literal("booleanArray"),
  propertyId: LoliIdSchema,
  propertyArrayQuantifier: QuantifierSchema,
  operator: z.enum(BooleanArrayConditionOperators),
});

export type BooleanArrayCondition = z.infer<typeof BooleanArrayConditionSchema>;
