import { z } from "zod";

import { BaseConditionSchema } from "./BaseCondition";

export const DateTimeConditionOperators = [
  "equalsOrIsAfter",
  "isBefore",
] as const;

export type DateTimeConditionOperator =
  (typeof DateTimeConditionOperators)[number];

export const DateTimeConditionOperandSchema = z.object({
  date: z.string().date(),
  time: z.string().time(),
  timezoneOffset: z.number(),
});

export type DateTimeConditionOperand = z.infer<
  typeof DateTimeConditionOperandSchema
>;

export const DateTimeConditionTimezoneOffsetModes = [
  "operandOffset",
  "localOffset",
] as const;

export type DateTimeConditionTimezoneOffsetMode =
  (typeof DateTimeConditionTimezoneOffsetModes)[number];

export const DateTimeConditionSchema = BaseConditionSchema.extend({
  type: z.literal("dateTime"),
  operator: z.enum(DateTimeConditionOperators),
  operand: DateTimeConditionOperandSchema,
  timezoneOffsetMode: z.enum(DateTimeConditionTimezoneOffsetModes),
});

export type DateTimeCondition = z.infer<typeof DateTimeConditionSchema>;
