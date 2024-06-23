import { z } from "zod";

import { LoliIdSchema } from "./LoliId";

export const PropertyPathSchema = z.array(z.string().min(1));

export type PropertyPath = z.infer<typeof PropertyPathSchema>;

export const PropertyTypes = [
  "string",
  "number",
  "boolean",
  "stringArray",
  "numberArray",
  "booleanArray",
] as const;

export type PropertyType = (typeof PropertyTypes)[number];

export const ArrayPropertyTypes = [
  "stringArray",
  "numberArray",
  "booleanArray",
] as const satisfies PropertyType[];

export type ArrayPropertyType = (typeof ArrayPropertyTypes)[number];

export const PropertySchema = z.object({
  id: LoliIdSchema,
  path: PropertyPathSchema,
  name: z.string().min(1),
  type: z.enum(PropertyTypes),
  rolloutDiscriminator: z.boolean(),
});

export type Property = z.infer<typeof PropertySchema>;

export type ArrayPropertyDataType<
  ARRAY_PROPERTY_TYPE extends ArrayPropertyType,
> = ARRAY_PROPERTY_TYPE extends "stringArray"
  ? string[]
  : ARRAY_PROPERTY_TYPE extends "numberArray"
    ? number[]
    : boolean[];

export type PropertyDataType<PROPERTY_TYPE extends PropertyType> =
  PROPERTY_TYPE extends "string"
    ? string
    : PROPERTY_TYPE extends "number"
      ? number
      : PROPERTY_TYPE extends "boolean"
        ? boolean
        : PROPERTY_TYPE extends "stringArray"
          ? string[]
          : PROPERTY_TYPE extends "numberArray"
            ? number[]
            : boolean[];

export type ArrayPropertyElementDataType<
  ARRAY_PROPERTY_TYPE extends ArrayPropertyType,
> = ArrayPropertyDataType<ARRAY_PROPERTY_TYPE>[number];

export type PropertyOrArrayPropertyElementDataType<
  PROPERTY_TYPE extends PropertyType,
> = PROPERTY_TYPE extends "string"
  ? string
  : PROPERTY_TYPE extends "number"
    ? number
    : PROPERTY_TYPE extends "boolean"
      ? boolean
      : PROPERTY_TYPE extends "stringArray"
        ? string
        : PROPERTY_TYPE extends "numberArray"
          ? number
          : boolean;
