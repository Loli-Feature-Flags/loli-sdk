import type { BooleanFeatureFlagRule } from "./BooleanFeatureFlagRule";
import type { NumberFeatureFlagRule } from "./NumberFeatureFlagRule";
import type { StringFeatureFlagRule } from "./StringFeatureFlagRule";

export type FeatureFlagRule =
  | BooleanFeatureFlagRule
  | NumberFeatureFlagRule
  | StringFeatureFlagRule;
