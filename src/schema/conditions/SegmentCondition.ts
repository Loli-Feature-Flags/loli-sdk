import { z } from "zod";

import { LoliIdSchema } from "../LoliId";
import { BaseConditionSchema } from "./BaseCondition";

export const SegmentConditionsOperators = ["isTrue", "isFalse"] as const;

export type SegmentConditionsOperator =
  (typeof SegmentConditionsOperators)[number];

export const SegmentConditionSchema = BaseConditionSchema.extend({
  type: z.literal("segment"),
  segmentId: LoliIdSchema,
  operator: z.enum(SegmentConditionsOperators),
});

export type SegmentCondition = z.infer<typeof SegmentConditionSchema>;
