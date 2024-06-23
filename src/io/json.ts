import { LoliSpecMalformedJsonError } from "../errors/types/LoliSpecMalformedJsonError";
import type { LoliSpec } from "../schema/LoliSpec";
import { assertValidLoliSpecSchema } from "../validation/schema";
import { assertSemanticallyValidLoliSpec } from "../validation/semantic/areas/combined";

/**
 * Serializes the given LoliSpec as a JSON string.
 *
 * @param loliSpec Spec to serialize.
 * @param prettyPrint (Optional) True if JSON pretty print shall be used.
 */
export function serializeLoliSpecAsJson(
  loliSpec: LoliSpec,
  prettyPrint: boolean = false,
): string {
  if (prettyPrint) {
    return JSON.stringify(loliSpec, null, 4);
  }

  return JSON.stringify(loliSpec);
}

/**
 * Deserializes a LoliSpec from a JSON string.
 *
 * If the given json is invalid JSON, a LoliSpecMalformedJsonError
 * is thrown.
 *
 * If the JSON does not match the LoliSpec's schema,
 * a sub method will throw a LoliSpecInvalidSchemaError.
 *
 * If the semantic validation fails, a LoliSpecSemanticIssuesError
 * will be thrown.
 *
 * @param json Raw JSON string to deserialize and validate.
 * @param performSemanticValidation (Optional, default true) If true, semantic validation will be performed, otherwise not.
 * @return Returns the deserialized and fully validated LoliSpec.
 */
export function deserializeLoliSpecFromJson(
  json: string,
  performSemanticValidation: boolean = true,
): LoliSpec {
  let parsed: null | unknown = null;

  try {
    parsed = JSON.parse(json) as unknown;
  } catch (e) {
    throw new LoliSpecMalformedJsonError(`${e}`);
  }

  let loliSpec: LoliSpec = assertValidLoliSpecSchema(parsed);

  if (performSemanticValidation) {
    loliSpec = assertSemanticallyValidLoliSpec(loliSpec);
  }

  return loliSpec;
}
