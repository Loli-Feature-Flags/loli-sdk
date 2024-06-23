import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../../schema/LoliSpec";
import type { EvaluationContext } from "../EvaluationContext";
import { computeRolloutGroup } from "./rolloutGroup";

describe("computeRolloutGroup", () => {
  test("Returns zero for LoliSpec with no rolloutDiscriminator properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "9a7s6da87s6d9",
            path: ["email"],
            name: "E-Mail",
            type: "string",
            rolloutDiscriminator: false,
          },
          {
            id: "kalsdh8as6d",
            path: ["id"],
            name: "User ID",
            type: "string",
            rolloutDiscriminator: false,
          },
          {
            id: "ai8sd68a67s5d",
            path: ["age"],
            name: "Age",
            type: "number",
            rolloutDiscriminator: false,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      email: "test@acme.com",
      id: "as98d65a8s5d47a64sd65as3d5as",
      age: 42,
    };

    expect(computeRolloutGroup(loliSpec, evaluationContext)).toBe(-1);
  });

  test("Returns zero for LoliSpec with rolloutDiscriminator properties that are all missing in evaluation context", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "9a7s6da87s6d9",
            path: ["email"],
            name: "E-Mail",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "kalsdh8as6d",
            path: ["id"],
            name: "User ID",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "ai8sd68a67s5d",
            path: ["age"],
            name: "Age",
            type: "number",
            rolloutDiscriminator: false,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      age: 42,
    };

    expect(computeRolloutGroup(loliSpec, evaluationContext)).toBe(-1);
  });

  test("Returns zero for LoliSpec with rolloutDiscriminator properties that are are all empty string values", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "9a7s6da87s6d9",
            path: ["email"],
            name: "E-Mail",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "kalsdh8as6d",
            path: ["id"],
            name: "User ID",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "ai8sd68a67s5d",
            path: ["age"],
            name: "Age",
            type: "number",
            rolloutDiscriminator: false,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      email: "",
      id: "",
      age: 42,
    };

    expect(computeRolloutGroup(loliSpec, evaluationContext)).toBe(-1);
  });

  test("Returns some random number for a string property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "string",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: "asdasd",
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number for a number property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "number",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: 32,
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number for a boolean property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "boolean",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: true,
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number for a stringArray property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "stringArray",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: ["asd7", "ajskhdas9d7as78"],
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number for a numberArray property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "numberArray",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: [1123, 123123],
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number for a booleanArray property", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "propertyId",
            path: ["property"],
            name: "Property",
            type: "booleanArray",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      property: [true, false, true, true],
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns some random number multiple mixed properties", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "stringPropertyId",
            path: ["string"],
            name: "String",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "numberPropertyId",
            path: ["number"],
            name: "Number",
            type: "number",
            rolloutDiscriminator: true,
          },
          {
            id: "booleanArrayPropertyId",
            path: ["booleanArray"],
            name: "Boolean Array",
            type: "booleanArray",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      string: "asd89a7sd9786asd",
      number: 42,
      booleanArray: [true, false, true, true],
    };

    const rolloutGroup = computeRolloutGroup(loliSpec, evaluationContext);

    expect(rolloutGroup).toBeGreaterThanOrEqual(0);
    expect(rolloutGroup).toBeLessThanOrEqual(100);
  });

  test("Returns the same rolloutGroup for different property names, different property orders, different property paths, different value orders", () => {
    const loliSpec1: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "stringPropertyId",
            path: ["string"],
            name: "String",
            type: "string",
            rolloutDiscriminator: true,
          },
          {
            id: "numberPropertyId",
            path: ["number"],
            name: "Number",
            type: "number",
            rolloutDiscriminator: true,
          },
          {
            id: "booleanArrayPropertyId",
            path: ["booleanArray"],
            name: "Boolean Array",
            type: "booleanArray",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const loliSpec2: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            id: "numberPropertyId",
            path: ["number2"],
            name: "asdasdasd239a7sd98a76sd",
            type: "number",
            rolloutDiscriminator: true,
          },
          {
            id: "booleanArrayPropertyId",
            path: ["booleanArray2"],
            name: "izausdbt9as5d8a5sd",
            type: "booleanArray",
            rolloutDiscriminator: true,
          },
          {
            id: "stringPropertyId",
            path: ["string2"],
            name: "iazsdbuasgd",
            type: "string",
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext1: EvaluationContext = {
      string: "asd89a7sd9786asd",
      number: 42,
      booleanArray: [true, false, true, true],
    };

    const evaluationContext2: EvaluationContext = {
      booleanArray2: [true, false, true, true],
      number2: 42,
      string2: "asd89a7sd9786asd",
    };

    const rolloutGroup1 = computeRolloutGroup(loliSpec1, evaluationContext1);
    const rolloutGroup2 = computeRolloutGroup(loliSpec2, evaluationContext2);

    expect(rolloutGroup1).toEqual(rolloutGroup2);
  });
});
