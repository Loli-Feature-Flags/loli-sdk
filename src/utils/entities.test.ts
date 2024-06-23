import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../schema/LoliSpec";
import {
  getFeatureFlagFromLoliSpecById,
  getFeatureFlagFromLoliSpecByName,
  getPropertyFromLoliSpecById,
  getSegmentFromLoliSpecById,
} from "./entities";

const spec: LoliSpec = {
  schemaVersion: 1,
  featureFlags: [
    {
      type: "boolean",
      id: "featureFlagId",
      name: "feature-flag",
      targeting: { enabled: true, rules: [] },
      description: "",
      defaultValue: false,
    },
  ],
  segments: [
    {
      id: "segmentId",
      name: "Segment",
      conditionSet: { operator: "and", conditions: [] },
    },
  ],
  evaluationContext: {
    properties: [
      {
        id: "propertyId",
        type: "string",
        path: ["email"],
        name: "E-Mail",

        rolloutDiscriminator: true,
      },
    ],
  },
};

describe("getFeatureFlagFromLoliSpecById", () => {
  test("Returns undefined for non-existing ID/feature flag", () => {
    expect(
      getFeatureFlagFromLoliSpecById(spec, "nonExistingFeatureFlagId"),
    ).toBeUndefined();
  });

  test("Returns feature flag for existing ID/feature flag", () => {
    expect(getFeatureFlagFromLoliSpecById(spec, "featureFlagId")).toBe(
      spec.featureFlags[0],
    );
  });
});

describe("getFeatureFlagFromLoliSpecByName", () => {
  test("Returns undefined for non-existing name/feature flag", () => {
    expect(
      getFeatureFlagFromLoliSpecByName(spec, "feature-flag-not-known"),
    ).toBeUndefined();
  });

  test("Returns feature flag for existing name/feature flag", () => {
    expect(getFeatureFlagFromLoliSpecByName(spec, "feature-flag")).toBe(
      spec.featureFlags[0],
    );
  });
});

describe("getSegmentFromLoliSpecById", () => {
  test("Returns undefined for non-existing ID/segment", () => {
    expect(
      getSegmentFromLoliSpecById(spec, "nonExistingSegmentId"),
    ).toBeUndefined();
  });

  test("Returns segment for existing ID/segment", () => {
    expect(getSegmentFromLoliSpecById(spec, "segmentId")).toBe(
      spec.segments[0],
    );
  });
});

describe("getPropertyFromLoliSpecById", () => {
  test("Returns undefined for non-existing ID/property", () => {
    expect(
      getPropertyFromLoliSpecById(spec, "nonExistingPropertyId"),
    ).toBeUndefined();
  });

  test("Returns property for existing ID/property", () => {
    expect(getPropertyFromLoliSpecById(spec, "propertyId")).toBe(
      spec.evaluationContext.properties[0],
    );
  });
});
