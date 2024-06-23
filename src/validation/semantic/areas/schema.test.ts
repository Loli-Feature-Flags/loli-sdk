import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../../../schema/LoliSpec";
import { SemanticIssueType } from "../SemanticIssueType";
import { validateLoliSpecSchemaSemantically } from "./schema";

function createTestLoliSpec({
  ff1Id,
  ff2Id,
  segment1Id,
  segment2Id,
  property1Id,
  property2Id,
}: {
  ff1Id: string;
  ff2Id: string;
  segment1Id: string;
  segment2Id: string;
  property1Id: string;
  property2Id: string;
}): LoliSpec {
  const spec: LoliSpec = {
    schemaVersion: 1,
    featureFlags: [
      {
        id: ff1Id,
        type: "boolean",
        name: "ff1",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: [] },
      },
      {
        id: ff2Id,
        type: "boolean",
        name: "ff2",
        defaultValue: false,
        description: "",
        targeting: { enabled: true, rules: [] },
      },
    ],
    segments: [
      {
        id: segment1Id,
        name: "segment1",
        conditionSet: {
          operator: "and",
          conditions: [],
        },
      },
      {
        id: segment2Id,
        name: "segment2",
        conditionSet: {
          operator: "and",
          conditions: [],
        },
      },
    ],
    evaluationContext: {
      properties: [
        {
          id: property1Id,
          name: "property1",
          type: "string",
          path: ["property1"],

          rolloutDiscriminator: true,
        },
        {
          id: property2Id,
          name: "property2",
          type: "string",
          path: ["property2"],

          rolloutDiscriminator: true,
        },
      ],
    },
  };

  return spec;
}

describe("validateLoliSpecSchemaSemantically", () => {
  describe("[implicit] validateUniqueIds", () => {
    test("All unique", () => {
      const spec = createTestLoliSpec({
        ff1Id: "ff1",
        ff2Id: "ff2",
        property1Id: "prop1",
        property2Id: "prop2",
        segment1Id: "segment1",
        segment2Id: "segment2",
      });

      const validation = validateLoliSpecSchemaSemantically(spec);

      expect(validation.isValid()).toBe(true);
    });

    test("Non-unique IDs", () => {
      const spec = createTestLoliSpec({
        ff1Id: "ff1",
        ff2Id: "shared",
        segment1Id: "segment1",
        segment2Id: "shared",
        property1Id: "shared",
        property2Id: "prop2",
      });

      const validation = validateLoliSpecSchemaSemantically(spec);

      expect(validation.isValid()).toBe(false);

      const issues = validation.getIssues();
      expect(issues.length).toBe(3);

      expect(issues[0].type).toBe(SemanticIssueType.DUPLICATED_ID);
      expect(issues[1].type).toBe(SemanticIssueType.DUPLICATED_ID);
      expect(issues[2].type).toBe(SemanticIssueType.DUPLICATED_ID);

      expect(issues[0].message).toContain("shared");
      expect(issues[1].message).toContain("shared");
      expect(issues[2].message).toContain("shared");

      expect(issues[0].path).toEqual(["featureFlags", 1]);
      expect(issues[1].path).toEqual(["segments", 1]);
      expect(issues[2].path).toEqual(["evaluationContext", "properties", 0]);
    });
  });
});
