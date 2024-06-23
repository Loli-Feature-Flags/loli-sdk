import { describe, expect, test } from "@jest/globals";

import type { ConditionSet } from "../../schema/conditionSet/ConditionSet";
import type { LoliSpec } from "../../schema/LoliSpec";
import {
  countSegmentReferences,
  countSegmentReferencesInConditionSet,
  isSegmentReferenced,
} from "./segments";

describe("countSegmentReferencesInConditionSet", () => {
  test("No references", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        { type: "segment", operator: "isTrue", segmentId: "notRef" },
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              { type: "segment", operator: "isTrue", segmentId: "notRef2" },
            ],
          },
        },
      ],
    };

    const nrOfReferences = countSegmentReferencesInConditionSet(
      "ref",
      conditionSet,
    );

    expect(nrOfReferences).toBe(0);
  });

  test("References on first level", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        { type: "segment", operator: "isTrue", segmentId: "ref" },
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              { type: "segment", operator: "isTrue", segmentId: "notRef2" },
            ],
          },
        },
      ],
    };

    const nrOfReferences = countSegmentReferencesInConditionSet(
      "ref",
      conditionSet,
    );

    expect(nrOfReferences).toBe(1);
  });

  test("References on first level and nested level", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        { type: "segment", operator: "isTrue", segmentId: "ref" },
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              { type: "segment", operator: "isTrue", segmentId: "ref" },
            ],
          },
        },
      ],
    };

    const nrOfReferences = countSegmentReferencesInConditionSet(
      "ref",
      conditionSet,
    );

    expect(nrOfReferences).toBe(2);
  });

  test("References only on nested level", () => {
    const conditionSet: ConditionSet = {
      operator: "and",
      conditions: [
        { type: "segment", operator: "isTrue", segmentId: "notRef" },
        {
          type: "conditionSet",
          conditionSet: {
            operator: "and",
            conditions: [
              { type: "segment", operator: "isTrue", segmentId: "ref" },
            ],
          },
        },
      ],
    };

    const nrOfReferences = countSegmentReferencesInConditionSet(
      "ref",
      conditionSet,
    );

    expect(nrOfReferences).toBe(1);
  });
});

describe("countSegmentReferences", () => {
  test("No references", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef2",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef3",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef4",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "notRef5",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef6",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(0);
    expect(segmentReferences).toBe(0);
    expect(featureFlagReferences).toBe(0);
  });

  test("References in one feature flag", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef2",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "ref",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "notRef5",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef6",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(2);
    expect(segmentReferences).toBe(0);
    expect(featureFlagReferences).toBe(1);
  });

  test("References in multiple feature flags", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "ref",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef3",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "ref",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "notRef5",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef6",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(3);
    expect(segmentReferences).toBe(0);
    expect(featureFlagReferences).toBe(2);
  });

  test("References in one segment", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef2",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef3",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef4",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(2);
    expect(segmentReferences).toBe(1);
    expect(featureFlagReferences).toBe(0);
  });

  test("References in multiple segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef2",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef3",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef4",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef6",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(2);
    expect(segmentReferences).toBe(2);
    expect(featureFlagReferences).toBe(0);
  });

  test("References in feature flags and segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "notRef2",
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "flag2",
          name: "flag2",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef3",
                    },
                    {
                      type: "conditionSet",
                      conditionSet: {
                        operator: "and",
                        conditions: [
                          {
                            type: "segment",
                            operator: "isTrue",
                            segmentId: "ref",
                          },
                        ],
                      },
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
          id: "segment1",
          name: "segment1",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "notRef5",
              },
              {
                type: "conditionSet",
                conditionSet: {
                  operator: "and",
                  conditions: [
                    {
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const {
      totalConditionReferences,
      segmentReferences,
      featureFlagReferences,
    } = countSegmentReferences("ref", loliSpec);

    expect(totalConditionReferences).toBe(3);
    expect(segmentReferences).toBe(1);
    expect(featureFlagReferences).toBe(2);
  });
});

describe("isEvaluationContextPropertyReferenced", () => {
  test("Not referenced", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
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
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const isReferenced = isSegmentReferenced("ref", loliSpec);

    expect(isReferenced).toBe(false);
  });

  test("Referenced by feature flag", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
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
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref42",
              },
            ],
          },
        },
      ],
    };

    const isReferenced = isSegmentReferenced("ref", loliSpec);

    expect(isReferenced).toBe(true);
  });

  test("Referenced by segment", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "notRef1",
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
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref",
              },
            ],
          },
        },
      ],
    };

    const isReferenced = isSegmentReferenced("ref", loliSpec);

    expect(isReferenced).toBe(true);
  });

  test("Referenced by feature flag and segment", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      evaluationContext: { properties: [] },
      featureFlags: [
        {
          id: "flag1",
          name: "flag1",
          type: "boolean",
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
                      type: "segment",
                      operator: "isTrue",
                      segmentId: "ref",
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
          id: "segment2",
          name: "segment2",
          conditionSet: {
            operator: "and",
            conditions: [
              {
                type: "segment",
                operator: "isTrue",
                segmentId: "ref",
              },
            ],
          },
        },
      ],
    };

    const isReferenced = isSegmentReferenced("ref", loliSpec);

    expect(isReferenced).toBe(true);
  });
});
