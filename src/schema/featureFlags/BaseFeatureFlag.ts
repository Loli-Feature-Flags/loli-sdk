import { z } from "zod";

import { LoliIdSchema } from "../LoliId";

export const FeatureFlagNameRegex = /^[a-zA-Z0-9]+([-_][a-zA-Z0-9]+)*$/;

export const FeatureFlagNameSchema = z
  .string()
  .min(1)
  .regex(
    FeatureFlagNameRegex,
    "Must only contain letters and numbers separated by single dashes or underscores.",
  );

export const BaseFeatureFlagSchema = z.object({
  id: LoliIdSchema,
  name: FeatureFlagNameSchema,
  description: z.string(),
});
