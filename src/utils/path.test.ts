import { describe, expect, test } from "@jest/globals";

import { formatPath, matchPaths, matchPathsPartially } from "./path";

describe("matchSpecPathsPartially", () => {
  test("Returns true for empty partial path and non-empty path", () => {
    expect(matchPathsPartially([], ["hello"])).toBe(true);
  });

  test("Returns true for empty partial path and empty path", () => {
    expect(matchPathsPartially([], [])).toBe(true);
  });

  test("Returns true for partial path", () => {
    expect(matchPathsPartially(["hello"], ["hello", "world"])).toBe(true);
  });

  test("Returns true for partial path which fully matches", () => {
    expect(matchPathsPartially(["hello", "world"], ["hello", "world"])).toBe(
      true,
    );
  });

  test("Returns false for not matching partial path", () => {
    expect(matchPathsPartially(["foo", "bar"], ["hello", "world"])).toBe(false);
  });
});

describe("matchSpecPaths", () => {
  test("Returns false for empty partial path and non-empty path", () => {
    expect(matchPaths([], ["hello"])).toBe(false);
  });

  test("Returns true for empty partial path and empty path", () => {
    expect(matchPaths([], [])).toBe(true);
  });

  test("Returns false for partial path", () => {
    expect(matchPaths(["hello"], ["hello", "world"])).toBe(false);
  });

  test("Returns true for path which fully matches", () => {
    expect(matchPaths(["hello", "world"], ["hello", "world"])).toBe(true);
  });

  test("Returns false for not matching path of same length", () => {
    expect(matchPaths(["foo", "bar"], ["hello", "world"])).toBe(false);
  });
});

describe("formatSpecPath", () => {
  test("Returns empty string for empty path", () => {
    expect(formatPath([])).toEqual("");
  });

  test("Returns array accessor for single number", () => {
    expect(formatPath([42])).toEqual("[42]");
  });

  test("Returns property string for single property name", () => {
    expect(formatPath(["fooBar"])).toEqual("fooBar");
  });

  test("Returns correct string for mixed path", () => {
    expect(
      formatPath(["firstSegment", 42, "thirdSegment", 1, 2, "foo", "bar"]),
    ).toEqual("firstSegment[42].thirdSegment[1][2].foo.bar");
  });
});
