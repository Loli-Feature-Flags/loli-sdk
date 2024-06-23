import { describe, expect, test } from "@jest/globals";

import { LoliSpecSemanticIssuesError } from "../../../errors/types/LoliSpecSemanticIssuesError";
import type { LoliSpec } from "../../../schema/LoliSpec";
import { SemanticIssueType } from "../SemanticIssueType";
import {
  assertSemanticallyValidLoliSpec,
  validateLoliSpecSemantically,
} from "./combined";

const validSpec: LoliSpec = {
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

const invalidSpec: LoliSpec = {
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
          {
            enabled: true,
            valuesOnMatch: [],
            conditionSet: {
              operator: "or",
              conditions: [],
            },
          },
        ],
      },
    },
    {
      id: "someOtherFeatureFlag",
      // Duplicated feature flag name
      name: "dark-mode",
      type: "boolean",
      defaultValue: false,
      description: "",
      targeting: {
        enabled: true,
        rules: [
          {
            enabled: true,
            // Rollout percentage not 100%
            valuesOnMatch: [{ value: true, rolloutPercentage: 55 }],
            conditionSet: {
              operator: "and",
              conditions: [
                // Non existing property
                {
                  type: "boolean",
                  propertyId: "nonExistingBooleanPropertyId",
                  operator: "isTrue",
                },
                {
                  type: "segment",
                  segmentId: "nonExistingSegmentId",
                  operator: "isTrue",
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
          // Cyclic dependency
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
          // Condition property data type mismatch
          {
            type: "boolean",
            propertyId: "emailPropId",
            operator: "isTrue",
          },
          // Cyclic dependency
          {
            type: "segment",
            segmentId: "earlyAdoptersSegmentId",
            operator: "isTrue",
          },
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
      // Duplicated ID + Duplicated Path
      {
        type: "boolean",
        id: "superAdminPropId",
        name: "Super Admin Flag 2",
        path: ["superAdmin"],
        rolloutDiscriminator: false,
      },
    ],
  },
};

describe("validateLoliSpecSemantically", () => {
  test("Returns valid validation result for semantically valid schema", () => {
    const validation = validateLoliSpecSemantically(validSpec);
    expect(validation.isValid()).toBe(true);
  });

  test("Returns invalid validation result for semantically invalid schema", () => {
    const validation = validateLoliSpecSemantically(invalidSpec);
    expect(validation.isValid()).toBe(false);
  });

  describe("Returns issues of all sub validation methods for invalid schema", () => {
    const validation = validateLoliSpecSemantically(invalidSpec);

    for (const semanticIssueType of Object.keys(SemanticIssueType)) {
      test(`${semanticIssueType}`, () => {
        const matchingIssue = validation
          .getIssues()
          .find((issue) => issue.type === semanticIssueType);
        expect(matchingIssue).toBeDefined();
      });
    }
  });
});

describe("assertSemanticallyValidLoliSpec", () => {
  test("Returns loli spec if valid", () => {
    expect(assertSemanticallyValidLoliSpec(validSpec)).toBe(validSpec);
  });

  test("Throws a LoliSpecSemanticIssuesError if semantic issues are present", () => {
    expect(() => {
      assertSemanticallyValidLoliSpec(invalidSpec);
    }).toThrow(LoliSpecSemanticIssuesError);
  });
});
