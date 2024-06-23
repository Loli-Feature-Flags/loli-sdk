import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../../../schema/LoliSpec";
import type { PropertyPath } from "../../../schema/Property";
import { SemanticIssueType } from "../SemanticIssueType";
import { validateLoliSpecPropertiesSemantically } from "./properties";

function createSpec({
  property1Path,
  property2Path,
  property3Path,
  property4Path,
}: {
  property1Path: PropertyPath;
  property2Path: PropertyPath;
  property3Path: PropertyPath;
  property4Path: PropertyPath;
}): LoliSpec {
  return {
    schemaVersion: 1,
    featureFlags: [],
    segments: [],
    evaluationContext: {
      properties: [
        {
          id: "property1Id",
          name: "property1Name",
          path: property1Path,
          type: "string",

          rolloutDiscriminator: false,
        },
        {
          id: "property2Id",
          name: "property2Name",
          path: property2Path,
          type: "string",

          rolloutDiscriminator: false,
        },
        {
          id: "property3Id",
          name: "property3Name",
          path: property3Path,
          type: "string",

          rolloutDiscriminator: false,
        },
        {
          id: "property4Id",
          name: "property4Name",
          path: property4Path,
          type: "string",

          rolloutDiscriminator: false,
        },
      ],
    },
  };
}

describe("validateLoliSpecPropertiesSemantically", () => {
  test("Should not return any issue for correct spec", () => {
    const spec = createSpec({
      property1Path: ["email"],
      property2Path: ["id"],
      property3Path: ["betaTester"],
      property4Path: ["foo"],
    });

    const validation = validateLoliSpecPropertiesSemantically(spec);

    expect(validation.isValid()).toBe(true);
  });

  test("Should return issues for all properties having the same path (case 1)", () => {
    const spec = createSpec({
      property1Path: ["email"],
      property2Path: ["email"],
      property3Path: ["betaTester"],
      property4Path: ["foo"],
    });

    const validation = validateLoliSpecPropertiesSemantically(spec);

    expect(validation.isValid()).toBe(false);

    const issues = validation.getIssues();
    expect(issues.length).toBe(2);

    expect(issues[0].type).toBe(SemanticIssueType.DUPLICATED_PROPERTY_PATH);
    expect(issues[0].path).toEqual(["evaluationContext", "properties", 0]);
    expect(issues[0].message).toContain("property1Id");
    expect(issues[0].message).toContain("property1Name");
    expect(issues[0].message).toContain(JSON.stringify(["email"]));

    expect(issues[1].type).toBe(SemanticIssueType.DUPLICATED_PROPERTY_PATH);
    expect(issues[1].path).toEqual(["evaluationContext", "properties", 1]);
    expect(issues[1].message).toContain("property2Id");
    expect(issues[1].message).toContain("property2Name");
    expect(issues[1].message).toContain(JSON.stringify(["email"]));
  });

  test("Should return issues for all properties having the same path (case 2 with nested paths)", () => {
    const spec = createSpec({
      property1Path: ["email"],
      property2Path: ["foo", "bar", "bar"],
      property3Path: ["id"],
      property4Path: ["foo", "bar", "bar"],
    });

    const validation = validateLoliSpecPropertiesSemantically(spec);

    expect(validation.isValid()).toBe(false);

    const issues = validation.getIssues();
    expect(issues.length).toBe(2);

    expect(issues[0].type).toBe(SemanticIssueType.DUPLICATED_PROPERTY_PATH);
    expect(issues[0].path).toEqual(["evaluationContext", "properties", 1]);
    expect(issues[0].message).toContain("property2Id");
    expect(issues[0].message).toContain("property2Name");
    expect(issues[0].message).toContain(JSON.stringify(["foo", "bar", "bar"]));

    expect(issues[1].type).toBe(SemanticIssueType.DUPLICATED_PROPERTY_PATH);
    expect(issues[1].path).toEqual(["evaluationContext", "properties", 3]);
    expect(issues[1].message).toContain("property4Id");
    expect(issues[1].message).toContain("property4Name");
    expect(issues[1].message).toContain(JSON.stringify(["foo", "bar", "bar"]));
  });
});
