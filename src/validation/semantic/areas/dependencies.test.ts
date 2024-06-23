import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../../../schema/LoliSpec";
import { SemanticIssueType } from "../SemanticIssueType";
import { validateLoliSpecDependenciesSemantically } from "./dependencies";

function createSpec(props?: {
  makeSuperAdminsSegmentDependOnEarlyAdoptersSegment?: boolean;
}): LoliSpec {
  return {
    schemaVersion: 1,
    featureFlags: [
      {
        id: "darkModeFeatureFlagId",
        name: "dark-mode",
        type: "boolean",
        defaultValue: false,
        description: "",
        targeting: {
          enabled: true,
          rules: [
            {
              enabled: true,
              valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
              conditionSet: {
                operator: "or",
                conditions: [
                  {
                    type: "segment",
                    segmentId: "earlyAdoptersSegmentId",
                    operator: "isTrue",
                  },
                  {
                    type: "string",
                    propertyId: "emailPropId",
                    operator: "equals",
                    operandsQuantifier: "some",
                    operands: ["ceo@acme.com"],
                  },
                ],
              },
            },
          ],
        },
      },
    ],
    segments: [
      {
        id: "earlyAdoptersSegmentId",
        name: "Early Adopters",
        conditionSet: {
          operator: "or",
          conditions: [
            {
              type: "boolean",
              propertyId: "betaTesterPropId",
              operator: "isTrue",
            },
            {
              type: "string",
              propertyId: "emailPropId",
              operator: "endsWith",
              operandsQuantifier: "some",
              operands: ["@acme.com"],
            },
            {
              type: "segment",
              segmentId: "superAdminsSegmentId",
              operator: "isTrue",
            },
          ],
        },
      },
      {
        id: "superAdminsSegmentId",
        name: "Super Admins",
        conditionSet: {
          operator: "and",
          conditions: [
            {
              type: "boolean",
              propertyId: "superAdminPropId",
              operator: "isTrue",
            },
            ...(props?.makeSuperAdminsSegmentDependOnEarlyAdoptersSegment
              ? [
                  {
                    type: "segment",
                    segmentId: "earlyAdoptersSegmentId",
                    operator: "isTrue",
                  } as const,
                ]
              : []),
          ],
        },
      },
    ],
    evaluationContext: {
      properties: [
        {
          type: "string",
          id: "emailPropId",
          name: "User E-Mail",
          path: ["email"],
          rolloutDiscriminator: true,
        },
        {
          type: "string",
          id: "idPropId",
          name: "User ID",
          path: ["id"],
          rolloutDiscriminator: true,
        },
        {
          type: "boolean",
          id: "betaTesterPropId",
          name: "Beta Tester Flag",
          path: ["betaTester"],
          rolloutDiscriminator: false,
        },
        {
          type: "boolean",
          id: "superAdminPropId",
          name: "Super Admin Flag",
          path: ["superAdmin"],
          rolloutDiscriminator: false,
        },
      ],
    },
  };
}

describe("validateLoliSpecDependenciesSemantically", () => {
  describe("Cyclic dependencies", () => {
    test("No issues are returned for correct schema without cyclic dependencies", () => {
      const spec = createSpec();

      const validation = validateLoliSpecDependenciesSemantically(spec);

      expect(validation.isValid()).toBe(true);
    });

    test("Issues are returned for schema with a cyclic dependency", () => {
      const spec = createSpec({
        makeSuperAdminsSegmentDependOnEarlyAdoptersSegment: true,
      });

      const validation = validateLoliSpecDependenciesSemantically(spec);

      expect(validation.isValid()).toBe(false);

      const issues = validation.getIssues();
      expect(issues.length).toBe(5);

      // Feature flag issues
      const issue0 = issues[0];
      expect(issue0.type).toBe(SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT);
      expect(issue0.path).toEqual(["featureFlags", 0]);
      expect(issue0.message).toContain(`"id":"superAdminsSegmentId"`);

      // Early adopters segment's issues
      const issue1 = issues[1];
      expect(issue1.type).toBe(SemanticIssueType.PART_OF_CYCLIC_DEPENDENCY);
      expect(issue1.path).toEqual(["segments", 0]);
      expect(issue1.message).toContain(`"id":"superAdminsSegmentId"`);

      const issue2 = issues[2];
      expect(issue2.type).toBe(SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT);
      expect(issue2.path).toEqual(["segments", 0]);
      expect(issue2.message).toContain(`"id":"superAdminsSegmentId"`);

      // Super admins segment's issues
      const issue3 = issues[3];
      expect(issue3.type).toBe(SemanticIssueType.PART_OF_CYCLIC_DEPENDENCY);
      expect(issue3.path).toEqual(["segments", 1]);
      expect(issue3.message).toContain(`"id":"earlyAdoptersSegmentId"`);

      const issue4 = issues[4];
      expect(issue4.type).toBe(SemanticIssueType.CYCLIC_DEPENDENCIES_PRESENT);
      expect(issue4.path).toEqual(["segments", 1]);
      expect(issue4.message).toContain(`"id":"earlyAdoptersSegmentId"`);
    });
  });
});
