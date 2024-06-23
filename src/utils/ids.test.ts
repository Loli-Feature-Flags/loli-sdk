import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../schema/LoliSpec";
import {
  getAllIdsUsedInSpec,
  getDuplicatedIdsUsedInSpec,
  getSpecEntitiesHavingDuplicatedIds,
  getUniqueIdsUsedInSpec,
} from "./ids";

describe("getAllIdsUsedInSpec", () => {
  test("Empty schema", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(0);
  });

  test("Only feature flags", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(2);
    expect(usedIds).toEqual(["f1", "f2"]);
  });

  test("Only evaluation context properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(3);
    expect(usedIds).toEqual(["p1", "p2", "p3"]);
  });

  test("Only segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(4);
    expect(usedIds).toEqual(["s1", "s2", "s3", "s4"]);
  });

  test("Mixed with unique IDs", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(9);
    expect(usedIds).toEqual([
      "f1",
      "f2",
      "p1",
      "p2",
      "p3",
      "s1",
      "s2",
      "s3",
      "s4",
    ]);
  });

  test("Mixed with duplicates", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
        // Duplicated ID entry
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          // Duplicated ID entry
          {
            id: "p1",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        // Duplicated ID entry
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getAllIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(10);
    expect(usedIds).toEqual([
      "f1",
      "f2",
      "f1",
      "p1",
      "p1",
      "p3",
      "s1",
      "s2",
      "s2",
      "s4",
    ]);
  });
});

describe("getUniqueIdsUsedInSpec", () => {
  test("Empty schema", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(0);
  });

  test("Only feature flags", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(2);
    expect(usedIds).toEqual(["f1", "f2"]);
  });

  test("Only evaluation context properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(3);
    expect(usedIds).toEqual(["p1", "p2", "p3"]);
  });

  test("Only segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(4);
    expect(usedIds).toEqual(["s1", "s2", "s3", "s4"]);
  });

  test("Mixed with unique IDs", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(9);
    expect(usedIds).toEqual([
      "f1",
      "f2",
      "p1",
      "p2",
      "p3",
      "s1",
      "s2",
      "s3",
      "s4",
    ]);
  });

  test("Mixed with duplicates", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
        // Duplicated ID entry
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          // Duplicated ID entry
          {
            id: "p1",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        // Duplicated ID entry
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const usedIds = getUniqueIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(4);
    expect(usedIds).toEqual(["f2", "p3", "s1", "s4"]);
  });
});

describe("getDuplicatedIdsUsedInSpec", () => {
  test("Empty schema", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const usedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(usedIds.length).toBe(0);
  });

  test("Only feature flags", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(duplicatedIds.length).toBe(0);
  });

  test("Only evaluation context properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [],
    };

    const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(duplicatedIds.length).toBe(0);
  });

  test("Only segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(duplicatedIds.length).toBe(0);
  });

  test("Mixed with unique IDs", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(duplicatedIds.length).toBe(0);
  });

  test("Mixed with duplicates", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
        // Duplicated ID entry
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          // Duplicated ID entry
          {
            id: "p1",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        // Duplicated ID entry
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const duplicatedIds = getDuplicatedIdsUsedInSpec(loliSpec);

    expect(duplicatedIds.length).toBe(3);
    expect(duplicatedIds).toEqual(["f1", "p1", "s2"]);
  });
});

describe("getSpecEntitiesHavingDuplicatedIds", () => {
  test("Empty schema", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(0);
    expect(entities.evaluationContext.properties.length).toBe(0);
    expect(entities.segments.length).toBe(0);
  });

  test("Only feature flags", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [],
      },
      segments: [],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(0);
    expect(entities.evaluationContext.properties.length).toBe(0);
    expect(entities.segments.length).toBe(0);
  });

  test("Only evaluation context properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(0);
    expect(entities.evaluationContext.properties.length).toBe(0);
    expect(entities.segments.length).toBe(0);
  });

  test("Only segments", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      evaluationContext: {
        properties: [],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(0);
    expect(entities.evaluationContext.properties.length).toBe(0);
    expect(entities.segments.length).toBe(0);
  });

  test("Mixed with unique IDs", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          {
            id: "p2",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s3",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(0);
    expect(entities.evaluationContext.properties.length).toBe(0);
    expect(entities.segments.length).toBe(0);
  });

  test("Mixed with duplicates", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
        {
          id: "f2",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f2",
          description: "",
          defaultValue: false,
        },
        // Duplicated ID entry
        {
          id: "f1",
          type: "boolean",
          targeting: { enabled: false, rules: [] },
          name: "f1",
          description: "",
          defaultValue: false,
        },
      ],
      evaluationContext: {
        properties: [
          {
            id: "p1",
            name: "p1",
            type: "string",
            path: ["p1"],

            rolloutDiscriminator: true,
          },
          // Duplicated ID entry
          {
            id: "p1",
            name: "p2",
            type: "string",
            path: ["p2"],

            rolloutDiscriminator: true,
          },
          {
            id: "p3",
            name: "p3",
            type: "string",
            path: ["p3"],

            rolloutDiscriminator: true,
          },
        ],
      },
      segments: [
        {
          id: "s1",
          name: "s1",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s2",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        // Duplicated ID entry
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        // Two more than in the other "describe"s.
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s2",
          name: "s3",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
        {
          id: "s4",
          name: "s4",
          conditionSet: {
            operator: "and",
            conditions: [],
          },
        },
      ],
    };

    const entities = getSpecEntitiesHavingDuplicatedIds(loliSpec);

    expect(entities.featureFlags.length).toBe(2);
    expect(entities.evaluationContext.properties.length).toBe(2);
    expect(entities.segments.length).toBe(4);

    expect(entities.featureFlags[0]).toStrictEqual(loliSpec.featureFlags[0]);
    expect(entities.featureFlags[1]).toStrictEqual(loliSpec.featureFlags[2]);

    expect(entities.evaluationContext.properties[0]).toStrictEqual(
      loliSpec.evaluationContext.properties[0],
    );
    expect(entities.evaluationContext.properties[1]).toStrictEqual(
      loliSpec.evaluationContext.properties[1],
    );

    expect(entities.segments[0]).toStrictEqual(loliSpec.segments[1]);
    expect(entities.segments[1]).toStrictEqual(loliSpec.segments[2]);
    expect(entities.segments[2]).toStrictEqual(loliSpec.segments[3]);
    expect(entities.segments[3]).toStrictEqual(loliSpec.segments[4]);
  });
});
