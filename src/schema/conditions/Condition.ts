import { z } from "zod";

import { AlwaysTrueConditionSchema } from "./AlwaysTrueCondition";
import type { BooleanArrayCondition } from "./BooleanArrayCondition";
import { BooleanArrayConditionSchema } from "./BooleanArrayCondition";
import type { BooleanCondition } from "./BooleanCondition";
import { BooleanConditionSchema } from "./BooleanCondition";
import { ConditionSetConditionSchema } from "./ConditionSetCondition";
import { DateTimeConditionSchema } from "./DateTimeCondition";
import type { NumberArrayCondition } from "./NumberArrayCondition";
import { NumberArrayConditionSchema } from "./NumberArrayCondition";
import type { NumberCondition } from "./NumberCondition";
import { NumberConditionSchema } from "./NumberCondition";
import { SegmentConditionSchema } from "./SegmentCondition";
import type { StringArrayCondition } from "./StringArrayCondition";
import { StringArrayConditionSchema } from "./StringArrayCondition";
import type { StringCondition } from "./StringCondition";
import { StringConditionSchema } from "./StringCondition";

export const ConditionSchema = z.discriminatedUnion("type", [
  StringConditionSchema,
  StringArrayConditionSchema,
  NumberConditionSchema,
  NumberArrayConditionSchema,
  BooleanConditionSchema,
  BooleanArrayConditionSchema,
  AlwaysTrueConditionSchema,
  ConditionSetConditionSchema,
  SegmentConditionSchema,
  DateTimeConditionSchema,
]);

export type Condition = z.infer<typeof ConditionSchema>;

export type ConditionType = Condition["type"];

export const ConditionTypes: ConditionType[] = [
  "string",
  "number",
  "boolean",
  "stringArray",
  "numberArray",
  "booleanArray",
  "conditionSet",
  "alwaysTrue",
  "segment",
  "dateTime",
] as const;

export type PropertyCondition =
  | StringCondition
  | NumberCondition
  | BooleanCondition
  | StringArrayCondition
  | NumberArrayCondition
  | BooleanArrayCondition;

export type PropertyConditionType = PropertyCondition["type"];

export const PropertyConditionTypes: PropertyConditionType[] = [
  "string",
  "number",
  "boolean",
  "stringArray",
  "numberArray",
  "booleanArray",
];

export type PropertyArrayCondition =
  | StringArrayCondition
  | NumberArrayCondition
  | BooleanArrayCondition;

export type PropertyArrayConditionType = PropertyArrayCondition["type"];

export const PropertyArrayConditionTypes: PropertyArrayConditionType[] = [
  "stringArray",
  "numberArray",
  "booleanArray",
];
