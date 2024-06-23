import { z } from "zod";

export const LoliIdSchema = z.string().min(1);
