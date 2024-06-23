import { describe, expect, test } from "@jest/globals";

import { SemanticIssue } from "./SemanticIssue";
import { SemanticIssueType } from "./SemanticIssueType";

describe("SemanticIssue", () => {
  test("Constructor", () => {
    const issue = new SemanticIssue(
      SemanticIssueType.DUPLICATED_ID,
      ["abc", 0, "foo"],
      "Test Issue",
    );

    expect(issue.type).toBe(SemanticIssueType.DUPLICATED_ID);
    expect(issue.path).toEqual(["abc", 0, "foo"]);
    expect(issue.message).toEqual("Test Issue");
  });

  test("matchesByPath", () => {
    const issue = new SemanticIssue(
      SemanticIssueType.DUPLICATED_ID,
      ["firstSegment", 42, "thirdSegment", 1, 2, "foo", "bar"],
      "Test Issue",
    );

    expect(
      issue.matchesByPath([
        "firstSegment",
        42,
        "thirdSegment",
        1,
        2,
        "foo",
        "bar",
      ]),
    ).toBe(true);

    expect(issue.matchesByPath([42, "thirdSegment", 1, 2, "foo", "bar"])).toBe(
      false,
    );

    expect(
      issue.matchesByPath(["firstSegment", 42, "thirdSegment", 1, 2, "foo"]),
    ).toBe(false);

    expect(
      issue.matchesByPath(["firstSegment", 42, "thirdSegment", 1, 2, "foo", 3]),
    ).toBe(false);

    expect(issue.matchesByPath([])).toBe(false);
  });

  test("matchesByPartialPath", () => {
    const issue = new SemanticIssue(
      SemanticIssueType.DUPLICATED_ID,
      ["firstSegment", 42, "thirdSegment", 1, 2, "foo", "bar"],
      "Test Issue",
    );

    expect(
      issue.matchesByPartialPath([
        "firstSegment",
        42,
        "thirdSegment",
        1,
        2,
        "foo",
        "bar",
      ]),
    ).toBe(true);

    expect(
      issue.matchesByPartialPath([42, "thirdSegment", 1, 2, "foo", "bar"]),
    ).toBe(false);

    expect(
      issue.matchesByPartialPath([
        "firstSegment",
        42,
        "thirdSegment",
        1,
        2,
        "foo",
      ]),
    ).toBe(true);

    expect(
      issue.matchesByPartialPath([
        "firstSegment",
        42,
        "thirdSegment",
        1,
        2,
        "foo",
        3,
      ]),
    ).toBe(false);

    expect(issue.matchesByPartialPath(["firstSegment", 42])).toBe(true);

    expect(issue.matchesByPartialPath([])).toBe(true);
  });

  test("pathToString", () => {
    const issue = new SemanticIssue(
      SemanticIssueType.DUPLICATED_ID,
      ["firstSegment", 42, "thirdSegment", 1, 2, "foo", "bar"],
      "Test Issue",
    );

    expect(issue.pathToString()).toEqual(
      "firstSegment[42].thirdSegment[1][2].foo.bar",
    );
  });

  test("toString", () => {
    const issue = new SemanticIssue(
      SemanticIssueType.DUPLICATED_ID,
      ["firstSegment", 42, "thirdSegment", 1, 2, "foo", "bar"],
      "Test Issue",
    );

    expect(issue.toString()).toEqual(
      "(DUPLICATED_ID) firstSegment[42].thirdSegment[1][2].foo.bar: Test Issue",
    );
  });
});
