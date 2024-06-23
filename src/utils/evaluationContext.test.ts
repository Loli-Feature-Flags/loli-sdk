import { describe, expect, test } from "@jest/globals";

import type { EvaluationContext } from "../evaluation/EvaluationContext";
import type { PropertyPath } from "../schema/Property";
import { getEvaluationContextValueByPath } from "./evaluationContext";

describe("getEvaluationContextValueByPath", () => {
  describe("Invalid paths ", () => {
    test("Returns undefined for empty path", () => {
      const path: PropertyPath = [];

      const evaluationContext: EvaluationContext = {
        foo: "bar",
        hello: { world: 42 },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for non existing longer path", () => {
      const path: PropertyPath = ["hello", "world", "test", "abc"];

      const evaluationContext: EvaluationContext = {
        foo: "bar",
        hello: { world: 42 },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined (but found = true) for existing shorter path, but incorrect data type", () => {
      const path: PropertyPath = ["hello"];

      const evaluationContext: EvaluationContext = {
        foo: "bar",
        hello: { world: 42 },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path with middle pathSegment denoting a primitive", () => {
      const path: PropertyPath = [
        "hello",
        "cake",
        "magic",
        "not",
        "the",
        "end",
      ];

      const evaluationContext: EvaluationContext = {
        foo: "bar",
        hello: { world: 42, cake: { magic: 42, is: { a: "lie" } } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for path with middle pathSegment denoting an array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: ["hello"] },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });
  });

  describe("Invalid evaluation contexts", () => {
    test("Returns undefined for empty object", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {};

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for primitive evaluation context", () => {
      const path: PropertyPath = ["foo", "bar", "abc"];

      const evaluationContext: EvaluationContext =
        "1" as unknown as EvaluationContext;

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for null evaluation context", () => {
      const path: PropertyPath = ["foo", "bar", "abc"];

      const evaluationContext: EvaluationContext =
        null as unknown as EvaluationContext;

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for undefined evaluation context", () => {
      const path: PropertyPath = ["foo", "bar", "abc"];

      const evaluationContext: EvaluationContext =
        undefined as unknown as EvaluationContext;

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });
  });

  describe("Null/undefined value cases", () => {
    test("Returns undefined for path denoting a top-level null value", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: null,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested null value", () => {
      const path: PropertyPath = ["foo", "bar", "abc"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { abc: null } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level undefined value", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: undefined,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested undefined value", () => {
      const path: PropertyPath = ["foo", "bar", "abc"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { abc: undefined } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: false,
        correctDataType: false,
      });
    });
  });

  describe("Correct path and evaluation context objects", () => {
    test("Returns true for path denoting a top-level true boolean", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: true,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: true,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns false for path denoting a top-level false boolean", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: false,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: false,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns true for path denoting a nested true boolean", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: true } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: true,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns false for path denoting a nested false boolean", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: false } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: false,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns string for path denoting a top-level string", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: "bar",
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: "bar",
        found: true,
        correctDataType: true,
      });
    });

    test("Returns string for path denoting a nested string", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: "hello" } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: "hello",
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a top-level number", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: 42,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: 42,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a top-level 0 (number)", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: 0,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: 0,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a top-level negative number", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: -11,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: -11,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a nested number", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: 99 } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: 99,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a nested 0 (number)", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: 0 } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: 0,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number for path denoting a nested negative number", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: -22 } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: -22,
        found: true,
        correctDataType: true,
      });
    });

    test("Returns boolean array for path denoting a top-level boolean array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: [true, false, true],
      };

      expect(
        getEvaluationContextValueByPath(
          path,
          evaluationContext,
          "booleanArray",
        ),
      ).toEqual({
        value: [true, false, true],
        found: true,
        correctDataType: true,
      });
    });

    test("Returns boolean array for path denoting a nested boolean array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: [true, false, false] } },
      };

      expect(
        getEvaluationContextValueByPath(
          path,
          evaluationContext,
          "booleanArray",
        ),
      ).toEqual({
        value: [true, false, false],
        found: true,
        correctDataType: true,
      });
    });

    test("Returns string array for path denoting a top-level string array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: ["abc", "def"],
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "stringArray"),
      ).toEqual({
        value: ["abc", "def"],
        found: true,
        correctDataType: true,
      });
    });

    test("Returns string array for path denoting a nested string array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: ["a", "b", "c"] } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "stringArray"),
      ).toEqual({
        value: ["a", "b", "c"],
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number array for path denoting a top-level number array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: [24, 42],
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "numberArray"),
      ).toEqual({
        value: [24, 42],
        found: true,
        correctDataType: true,
      });
    });

    test("Returns number array for path denoting a nested number array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: [3, 2, 1] } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "numberArray"),
      ).toEqual({
        value: [3, 2, 1],
        found: true,
        correctDataType: true,
      });
    });
  });

  describe("Type and value mismatches", () => {
    test("Returns undefined for path denoting a top-level boolean but value is a number", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: 123,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested boolean but value is an array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: ["123", "123"] } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "boolean"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level string but value is a boolean", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: false,
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested string but value is a number", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: 81623 } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "string"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level number but value is a string", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: "42",
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested number but value is an array", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: [44, 55] } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "number"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level boolean array but value is a mixed array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: [true, false, true, 1, "string"] as unknown as number[],
      };

      expect(
        getEvaluationContextValueByPath(
          path,
          evaluationContext,
          "booleanArray",
        ),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested boolean array but value is a string", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: "" } },
      };

      expect(
        getEvaluationContextValueByPath(
          path,
          evaluationContext,
          "booleanArray",
        ),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level string array but value is a number array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: [1, 2, 3],
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "stringArray"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested string array but value is a boolean", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: true } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "stringArray"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a top-level number array but value is mixed array", () => {
      const path: PropertyPath = ["foo"];

      const evaluationContext: EvaluationContext = {
        foo: [24, 42, "hello", "world"] as number[],
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "numberArray"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });

    test("Returns undefined for path denoting a nested number array but value was a string", () => {
      const path: PropertyPath = ["foo", "bar", "test"];

      const evaluationContext: EvaluationContext = {
        foo: { bar: { test: "[3, 2, 1]" } },
      };

      expect(
        getEvaluationContextValueByPath(path, evaluationContext, "numberArray"),
      ).toEqual({
        value: undefined,
        found: true,
        correctDataType: false,
      });
    });
  });
});
