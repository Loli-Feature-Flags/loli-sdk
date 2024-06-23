import { z } from "zod";

export const Quantifiers = ["some", "every", "notAny", "notEvery"] as const;

export const QuantifierSchema = z.enum(Quantifiers);

export type Quantifier = z.infer<typeof QuantifierSchema>;
