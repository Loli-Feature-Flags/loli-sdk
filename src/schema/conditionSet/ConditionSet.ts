import { z } from "zod";

import type { Condition } from "../conditions/Condition";
import { ConditionSchema } from "../conditions/Condition";

export const ConditionSetOperators = ["and", "or", "nand", "nor"] as const;

export type ConditionSetOperator = (typeof ConditionSetOperators)[number];

export type ConditionSet = {
  operator: ConditionSetOperator;
  conditions: Condition[];
};

const lazyConditionsSchema = z.lazy(() => z.array(ConditionSchema));

export const ConditionSetSchema: z.ZodType<ConditionSet> = z.object({
  operator: z.enum(["and", "or", "nand", "nor"]),
  conditions: lazyConditionsSchema,
});
