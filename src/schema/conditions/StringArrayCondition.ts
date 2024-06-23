import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";
import { QuantifierSchema } from "./Quantifier";

export const StringArrayConditionOperators = [
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
  "hasElements",
  "hasNoElements",
] as const;

export type StringArrayConditionOperator =
  (typeof StringArrayConditionOperators)[number];

export const StringArrayConditionSchema = BaseConditionSchema.extend({
  type: z.literal("stringArray"),
  propertyId: LoliIdSchema,
  propertyArrayQuantifier: QuantifierSchema,
  operator: z.enum(StringArrayConditionOperators),
  operandsQuantifier: QuantifierSchema,
  operands: z.string().array(),
});

export type StringArrayCondition = z.infer<typeof StringArrayConditionSchema>;
