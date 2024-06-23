import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";
import { QuantifierSchema } from "./Quantifier";

export const NumberArrayConditionOperators = [
  "equals",
  "doesNotEqual",
  "isLessThan",
  "isLessThanEquals",
  "isGreaterThan",
  "isGreaterThanEquals",
  "isOdd",
  "isEven",
  "hasElements",
  "hasNoElements",
] as const;

export type NumberArrayConditionOperator =
  (typeof NumberArrayConditionOperators)[number];

export const NumberArrayConditionSchema = BaseConditionSchema.extend({
  type: z.literal("numberArray"),
  propertyId: LoliIdSchema,
  propertyArrayQuantifier: QuantifierSchema,
  operator: z.enum(NumberArrayConditionOperators),
  operandsQuantifier: QuantifierSchema,
  operands: z.number().array(),
});

export type NumberArrayCondition = z.infer<typeof NumberArrayConditionSchema>;
