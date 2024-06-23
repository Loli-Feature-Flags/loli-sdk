import { describe, expect, test } from "@jest/globals";

import type {
  FeatureFlag,
  FeatureFlagType,
} from "../schema/featureFlags/FeatureFlag";
import { FeatureFlagTypes } from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import type { EvaluationContext } from "./EvaluationContext";
import type { EvaluationMetadata } from "./EvaluationMetadata";
import { evaluateFeatureFlag } from "./featureFlag";

describe("evaluateFeatureFlag", () => {
  for (const type of FeatureFlagTypes) {
    describe(`Feature flag type = ${type}`, () => {
      describe("Default value cases", () => {
        const loliSpec: LoliSpec = {
          schemaVersion: 1,
          featureFlags: [],
          segments: [],
          evaluationContext: {
            properties: [],
          },
        };

        const evaluationContext: EvaluationContext = {};

        const evaluationMetadata: EvaluationMetadata = {
          rolloutGroup: 10,
          evaluationDateTime: new Date(),
        };

        const testCases: {
          [key in FeatureFlagType]: {
            noRulesDefaultValue: { featureFlag: FeatureFlag & { type: key } };
            disabledTargetingWithRulesDefaultValue: {
              featureFlag: FeatureFlag & { type: key };
            };
            enabledTargetingWithDisabledRulesDefaultValue: {
              featureFlag: FeatureFlag & { type: key };
            };
            noValuesOnMatchDefaultValue: {
              featureFlag: FeatureFlag & { type: key };
            };
          };
        } = {
          boolean: {
            noRulesDefaultValue: {
              featureFlag: {
                type: "boolean",
                defaultValue: false,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [],
                },
              },
            },
            disabledTargetingWithRulesDefaultValue: {
              featureFlag: {
                type: "boolean",
                defaultValue: false,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: false,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [{ rolloutPercentage: 100, value: true }],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            enabledTargetingWithDisabledRulesDefaultValue: {
              featureFlag: {
                type: "boolean",
                defaultValue: false,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [{ rolloutPercentage: 100, value: true }],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            noValuesOnMatchDefaultValue: {
              featureFlag: {
                type: "boolean",
                defaultValue: false,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
          },
          number: {
            noRulesDefaultValue: {
              featureFlag: {
                type: "number",
                defaultValue: 0,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [],
                },
              },
            },
            disabledTargetingWithRulesDefaultValue: {
              featureFlag: {
                type: "number",
                defaultValue: 0,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: false,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [{ rolloutPercentage: 100, value: 42 }],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            enabledTargetingWithDisabledRulesDefaultValue: {
              featureFlag: {
                type: "number",
                defaultValue: 0,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [{ rolloutPercentage: 100, value: 42 }],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            noValuesOnMatchDefaultValue: {
              featureFlag: {
                type: "number",
                defaultValue: 0,
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
          },
          string: {
            noRulesDefaultValue: {
              featureFlag: {
                type: "string",
                defaultValue: "",
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [],
                },
              },
            },
            disabledTargetingWithRulesDefaultValue: {
              featureFlag: {
                type: "string",
                defaultValue: "",
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: false,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { rolloutPercentage: 100, value: "hello" },
                      ],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            enabledTargetingWithDisabledRulesDefaultValue: {
              featureFlag: {
                type: "string",
                defaultValue: "",
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [
                        { rolloutPercentage: 100, value: "hello" },
                      ],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
            noValuesOnMatchDefaultValue: {
              featureFlag: {
                type: "string",
                defaultValue: "",
                name: "feature flag",
                id: "someId",
                description: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: false,
                      valuesOnMatch: [],
                      conditionSet: {
                        operator: "or",
                        conditions: [{ type: "alwaysTrue" }],
                      },
                    },
                  ],
                },
              },
            },
          },
        };

        test(`Returns defaultValue if no rules are defined`, () => {
          const featureFlag = testCases[type].noRulesDefaultValue.featureFlag;

          expect(
            evaluateFeatureFlag(
              featureFlag,
              loliSpec,
              evaluationContext,
              evaluationMetadata,
            ),
          ).toBe(featureFlag.defaultValue);
        });

        test(`Returns defaultValue if targeting is disabled`, () => {
          const featureFlag =
            testCases[type].disabledTargetingWithRulesDefaultValue.featureFlag;

          expect(
            evaluateFeatureFlag(
              featureFlag,
              loliSpec,
              evaluationContext,
              evaluationMetadata,
            ),
          ).toBe(featureFlag.defaultValue);
        });

        test(`Returns defaultValue if targeting is enabled but all rules are disabled`, () => {
          const featureFlag =
            testCases[type].enabledTargetingWithDisabledRulesDefaultValue
              .featureFlag;

          expect(
            evaluateFeatureFlag(
              featureFlag,
              loliSpec,
              evaluationContext,
              evaluationMetadata,
            ),
          ).toBe(featureFlag.defaultValue);
        });

        test(`Returns defaultValue if rule is matched but rule does not have any valuesOnMatch`, () => {
          const featureFlag =
            testCases[type].enabledTargetingWithDisabledRulesDefaultValue
              .featureFlag;

          expect(
            evaluateFeatureFlag(
              featureFlag,
              loliSpec,
              evaluationContext,
              evaluationMetadata,
            ),
          ).toBe(featureFlag.defaultValue);
        });
      });

      describe("Rule matching cases", () => {
        const loliSpec: LoliSpec = {
          schemaVersion: 1,
          featureFlags: [],
          segments: [],
          evaluationContext: {
            properties: [
              {
                type: "string",
                id: "emailPropId",
                name: "E-Mail",
                path: ["email"],
                rolloutDiscriminator: true,
              },
              {
                type: "number",
                id: "agePropId",
                name: "Age",
                path: ["age"],
                rolloutDiscriminator: false,
              },
            ],
          },
        };

        const evaluationContext: EvaluationContext = {
          email: "test@acme.com",
          age: 42,
        };

        const testCases: {
          [key in FeatureFlagType]: {
            expected: key extends "string"
              ? string
              : key extends "number"
                ? number
                : boolean;
            rolloutGroup: number;
            featureFlag: FeatureFlag & { type: key };
          }[];
        } = {
          boolean: [
            // One matching rule, one value to be applied
            {
              expected: true,
              rolloutGroup: 1,
              featureFlag: {
                type: "boolean",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: false,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@acme.com"],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, second value will be rolled out
            {
              expected: true,
              rolloutGroup: 64.5,
              featureFlag: {
                type: "boolean",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: false,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: false, rolloutPercentage: 80 },
                        { value: true, rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: false, rolloutPercentage: 40 },
                        { value: true, rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, first value will be rolled out
            {
              expected: false,
              rolloutGroup: 23.17,
              featureFlag: {
                type: "boolean",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: false,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: false, rolloutPercentage: 80 },
                        { value: true, rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: false, rolloutPercentage: 40 },
                        { value: true, rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // No matching rule
            {
              expected: false,
              rolloutGroup: 48.12,
              featureFlag: {
                type: "boolean",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: false,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [67],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
          number: [
            // One matching rule, one value to be applied
            {
              expected: 99,
              rolloutGroup: 1,
              featureFlag: {
                type: "number",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: 0,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [{ value: 99, rolloutPercentage: 100 }],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@acme.com"],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, second value will be rolled out
            {
              expected: 77,
              rolloutGroup: 64.5,
              featureFlag: {
                type: "number",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: 0,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 22, rolloutPercentage: 80 },
                        { value: 55, rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 66, rolloutPercentage: 40 },
                        { value: 77, rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, first value will be rolled out
            {
              expected: 66,
              rolloutGroup: 31.86,
              featureFlag: {
                type: "number",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: 0,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 22, rolloutPercentage: 80 },
                        { value: 55, rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 66, rolloutPercentage: 40 },
                        { value: 77, rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // No matching rule
            {
              expected: 0,
              rolloutGroup: 27.45,
              featureFlag: {
                type: "number",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: 0,
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 22, rolloutPercentage: 80 },
                        { value: 55, rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: 66, rolloutPercentage: 40 },
                        { value: 77, rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [67],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
          string: [
            // One matching rule, one value to be applied
            {
              expected: "variant-aaa",
              rolloutGroup: 1,
              featureFlag: {
                type: "string",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-aaa", rolloutPercentage: 100 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@acme.com"],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, second value will be rolled out
            {
              expected: "variant-ddd",
              rolloutGroup: 64.5,
              featureFlag: {
                type: "string",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-aaa", rolloutPercentage: 80 },
                        { value: "variant-bbb", rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-ccc", rolloutPercentage: 40 },
                        { value: "variant-ddd", rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // Two rules, second will match, first value will be rolled out
            {
              expected: "variant-ccc",
              rolloutGroup: 11.76,
              featureFlag: {
                type: "string",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-aaa", rolloutPercentage: 80 },
                        { value: "variant-bbb", rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-ccc", rolloutPercentage: 40 },
                        { value: "variant-ddd", rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [18],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            // No matching rule
            {
              expected: "",
              rolloutGroup: 97.1,
              featureFlag: {
                type: "string",
                name: "Feature Flag",
                id: "897as6dh89a7sd",
                description: "",
                defaultValue: "",
                targeting: {
                  enabled: true,
                  rules: [
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-aaa", rolloutPercentage: 80 },
                        { value: "variant-bbb", rolloutPercentage: 20 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "string",
                            propertyId: "emailPropId",
                            operator: "endsWith",
                            operandsQuantifier: "some",
                            operands: ["@emca.com"],
                          },
                        ],
                      },
                    },
                    {
                      enabled: true,
                      valuesOnMatch: [
                        { value: "variant-ccc", rolloutPercentage: 40 },
                        { value: "variant-ddd", rolloutPercentage: 60 },
                      ],
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "number",
                            propertyId: "agePropId",
                            operator: "isGreaterThanEquals",
                            operandsQuantifier: "some",
                            operands: [67],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          ],
        };

        for (const { expected, rolloutGroup, featureFlag } of testCases[type]) {
          test(`Returns ${JSON.stringify(expected)} for rolloutGroup = ${rolloutGroup}`, () => {
            const evaluationMetadata: EvaluationMetadata = {
              rolloutGroup,
              evaluationDateTime: new Date(),
            };

            expect(
              evaluateFeatureFlag(
                featureFlag,
                loliSpec,
                evaluationContext,
                evaluationMetadata,
              ),
            ).toBe(expected);
          });
        }
      });
    });
  }
});
