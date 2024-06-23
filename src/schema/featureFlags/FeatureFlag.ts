import { z } from "zod";

import { BooleanFeatureFlagSchema } from "./BooleanFeatureFlag";
import { NumberFeatureFlagSchema } from "./NumberFeatureFlag";
import { StringFeatureFlagSchema } from "./StringFeatureFlag";

export const FeatureFlagTypes = ["boolean", "string", "number"] as const;

export type FeatureFlagType = (typeof FeatureFlagTypes)[number];

export const FeatureFlagSchema = z.discriminatedUnion("type", [
  BooleanFeatureFlagSchema,
  StringFeatureFlagSchema,
  NumberFeatureFlagSchema,
]);

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

export type FeatureFlagOutput<FEATURE_FLAG extends FeatureFlag> =
  FEATURE_FLAG["defaultValue"];
