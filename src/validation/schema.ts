import { LoliSpecInvalidSchemaError } from "../errors/types/LoliSpecInvalidSchemaError";
import type { LoliSpec } from "../schema/LoliSpec";
import { LoliSpecSchema } from "../schema/LoliSpec";

/**
 * Validates that the given data conforms the LoliSpec schema.
 *
 * Uses a Zod schema under the hood. If the given data is invalid,
 * a LoliSpecInvalidSchemaError is thrown.
 *
 * @param unknownData Arbitrary input data to validate.
 * @return Validation result.
 */
export function validateLoliSpecSchema(unknownData: unknown) {
  return LoliSpecSchema.safeParse(unknownData);
}

/**
 * Assert that the given data is a valid LoliSpec according
 * to {@link validateLoliSpecSchema}. If it is invalid,
 * this function throws a {@link LoliSpecInvalidSchemaError}.
 *
 * @param unknownData Arbitrary input data to validate.
 * @return Validated LoliSpec object.
 */
export function assertValidLoliSpecSchema(unknownData: unknown): LoliSpec {
  const result = validateLoliSpecSchema(unknownData);

  if (!result.success) {
    throw new LoliSpecInvalidSchemaError(
      result.error.toString(),
      result.error.errors,
    );
  }

  return result.data;
}
