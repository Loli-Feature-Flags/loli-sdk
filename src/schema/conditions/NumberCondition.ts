import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";
import { QuantifierSchema } from "./Quantifier";

export const NumberConditionOperators = [
  "equals",
  "doesNotEqual",
  "isLessThan",
  "isLessThanEquals",
  "isGreaterThan",
  "isGreaterThanEquals",
  "isOdd",
  "isEven",
] as const;

export type NumberConditionOperator = (typeof NumberConditionOperators)[number];

export const NumberConditionSchema = BaseConditionSchema.extend({
  type: z.literal("number"),
  propertyId: LoliIdSchema,
  operator: z.enum(NumberConditionOperators),
  operandsQuantifier: QuantifierSchema,
  operands: z.number().array(),
});

export type NumberCondition = z.infer<typeof NumberConditionSchema>;
