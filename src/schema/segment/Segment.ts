import { z } from "zod";

import { ConditionSetSchema } from "../conditionSet/ConditionSet";
import { LoliIdSchema } from "../LoliId";

export const SegmentNameRegex = /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/;

export const SegmentNameSchema = z
  .string()
  .min(1)
  .regex(
    SegmentNameRegex,
    "Must only contain letters and numbers separated by single dashes or underscores.",
  );

export const SegmentSchema = z.object({
  id: LoliIdSchema,
  name: SegmentNameSchema,
  conditionSet: z.lazy(() => ConditionSetSchema),
});

export type Segment = z.infer<typeof SegmentSchema>;
