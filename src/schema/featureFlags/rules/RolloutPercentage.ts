import { z } from "zod";

export const RolloutPercentageSchema = z.number().min(0).max(100);
