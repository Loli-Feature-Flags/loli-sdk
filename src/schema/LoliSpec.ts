import { z } from "zod";

import { FeatureFlagSchema } from "./featureFlags/FeatureFlag";
import { PropertySchema } from "./Property";
import { SegmentSchema } from "./segment/Segment";

export const LoliSpecSchema = z.object({
  schemaVersion: z.literal(1),
  featureFlags: z.array(FeatureFlagSchema),
  segments: z.array(SegmentSchema),
  evaluationContext: z.object({
    properties: z.array(PropertySchema),
  }),
});

export type LoliSpec = z.infer<typeof LoliSpecSchema>;
