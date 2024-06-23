import { describe, expect, test } from "@jest/globals";

import { LoliSpecInvalidSchemaError } from "../errors/types/LoliSpecInvalidSchemaError";
import type { LoliSpec } from "../schema/LoliSpec";
import { assertValidLoliSpecSchema, validateLoliSpecSchema } from "./schema";

describe("validateLoliSpecSchema", () => {
  test("Returns valid result for valid spec/schema", () => {
    const spec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: { properties: [] },
    };

    const result = validateLoliSpecSchema(spec);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(spec);
  });

  test("Returns an error result for invalid spec/schema", () => {
    const spec = {
      schemaVersion: 1,
      segments: [],
      evaluationContext: { properties: [] },
    };

    const result = validateLoliSpecSchema(spec);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});

describe("assertValidLoliSpecSchema", () => {
  test("Returns validated object for valid spec/schema", () => {
    const spec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: { properties: [] },
    };

    const validatedSpec = assertValidLoliSpecSchema(spec);

    expect(JSON.stringify(validatedSpec)).toEqual(JSON.stringify(spec));
  });

  test("Throws error for invalid spec/schema", () => {
    const spec = {
      schemaVersion: 1,
      segments: [],
      evaluationContext: { properties: [] },
    };

    expect(() => {
      assertValidLoliSpecSchema(spec);
    }).toThrow(LoliSpecInvalidSchemaError);
  });
});
