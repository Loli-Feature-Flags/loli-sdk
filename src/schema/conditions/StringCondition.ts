import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";
import { QuantifierSchema } from "./Quantifier";

export const StringConditionOperators = [
  "equals",
  "doesNotEqual",
  "startsWith",
  "doesNotStartWith",
  "endsWith",
  "doesNotEndWith",
  "isBlank",
  "isNotBlank",
  "matchesRegex",
  "doesNotMatchRegex",
] as const;

export type StringConditionOperator = (typeof StringConditionOperators)[number];

export const StringConditionSchema = BaseConditionSchema.extend({
  type: z.literal("string"),
  propertyId: LoliIdSchema,
  operator: z.enum(StringConditionOperators),
  operandsQuantifier: QuantifierSchema,
  operands: z.string().array(),
});

export type StringCondition = z.infer<typeof StringConditionSchema>;
