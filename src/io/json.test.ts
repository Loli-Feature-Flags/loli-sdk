import { describe, expect, test } from "@jest/globals";

import { LoliSpecInvalidSchemaError } from "../errors/types/LoliSpecInvalidSchemaError";
import { LoliSpecMalformedJsonError } from "../errors/types/LoliSpecMalformedJsonError";
import { LoliSpecSemanticIssuesError } from "../errors/types/LoliSpecSemanticIssuesError";
import type { LoliSpec } from "../schema/LoliSpec";
import { deserializeLoliSpecFromJson, serializeLoliSpecAsJson } from "./json";

describe("serializeLoliSpecAsJson", () => {
  const spec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [],
    segments: [],
    evaluationContext: {
      properties: [],
    },
  };

  test("Normal mode returns stringified spec", () => {
    expect(serializeLoliSpecAsJson(spec)).toEqual(JSON.stringify(spec));
  });

  test("Pretty mode returns stringified pretty print spec", () => {
    expect(serializeLoliSpecAsJson(spec, true)).toEqual(
      JSON.stringify(spec, null, 4),
    );
  });
});

describe("deserializeLoliSpecFromJson", () => {
  test("Throws LoliSpecMalformedJsonError for invalid JSON string", () => {
    expect(() => {
      deserializeLoliSpecFromJson("{asdi876avs876d");
    }).toThrow(LoliSpecMalformedJsonError);
  });

  test("Throws LoliSpecInvalidSchemaError for invalid spec schema", () => {
    const json = JSON.stringify({
      schemaVersion: 1,
      segments: [],
      evaluationContext: { properties: [] },
    });

    expect(() => {
      deserializeLoliSpecFromJson(json);
    }).toThrow(LoliSpecInvalidSchemaError);
  });

  test("Throws LoliSpecSemanticIssuesError for semantic issues", () => {
    const specWithSemanticIssues: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [
        {
          id: "duplicatedId",
          name: "Segment-1",
          conditionSet: { operator: "and", conditions: [] },
        },
        {
          id: "duplicatedId",
          name: "Segment-2",
          conditionSet: { operator: "or", conditions: [] },
        },
      ],
      evaluationContext: {
        properties: [],
      },
    };

    const json = JSON.stringify(specWithSemanticIssues);

    expect(() => {
      deserializeLoliSpecFromJson(json);
    }).toThrow(LoliSpecSemanticIssuesError);
  });

  test("Returns spec when skipping semantic validation", () => {
    const specWithSemanticIssues: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [
        {
          id: "duplicatedId",
          name: "Segment-1",
          conditionSet: { operator: "and", conditions: [] },
        },
        {
          id: "duplicatedId",
          name: "Segment-2",
          conditionSet: { operator: "or", conditions: [] },
        },
      ],
      evaluationContext: {
        properties: [],
      },
    };

    const json = JSON.stringify(specWithSemanticIssues);

    const result = deserializeLoliSpecFromJson(json, false);

    expect(JSON.stringify(result)).toEqual(json);
  });

  test("Returns validated LoliSpec object for valid JSON input", () => {
    const spec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [],
      },
    };

    expect(deserializeLoliSpecFromJson(JSON.stringify(spec))).toEqual(spec);
  });
});
