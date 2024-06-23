import { describe, expect, test } from "@jest/globals";

import { evaluateAlwaysTrueCondition } from "./alwaysTrueCondition";

describe("evaluateAlwaysTrueCondition", () => {
  test("Returns true", () => {
    expect(evaluateAlwaysTrueCondition()).toBe(true);
  });
});
