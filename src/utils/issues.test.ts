import { describe, expect, test } from "@jest/globals";

import { SemanticIssue } from "../validation/semantic/SemanticIssue";
import { SemanticIssueType } from "../validation/semantic/SemanticIssueType";
import { filterIssuesByPartialPath, filterIssuesByPath } from "./issues";

describe("filterIssuesByPartialPath", () => {
  test("Returns no matching issues for empty input array", () => {
    const issues: SemanticIssue[] = [];

    expect(filterIssuesByPartialPath(["foo"], issues).length).toBe(0);
  });

  test("Returns no matching issues for unknown path", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
    ];

    expect(filterIssuesByPartialPath(["foo"], issues).length).toBe(0);
  });

  test("Returns one matching issue for correct partial path", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
    ];

    const matchingIssues = filterIssuesByPartialPath(["hello"], issues);
    expect(matchingIssues.length).toBe(1);
    expect(matchingIssues).toEqual([issues[0]]);
  });

  test("Returns one matching issue for correct partial path which fully matches", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
    ];

    const matchingIssues = filterIssuesByPartialPath(
      ["hello", "world"],
      issues,
    );
    expect(matchingIssues.length).toBe(1);
    expect(matchingIssues).toEqual([issues[0]]);
  });

  test("Returns multiple matching issues by correct partial path", () => {
    const issues = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "abc",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "def",
      ),
    ];

    const matchingIssues = filterIssuesByPartialPath(["foo", 2], issues);
    expect(matchingIssues.length).toBe(2);
    expect(matchingIssues).toEqual([issues[1], issues[2]]);
  });

  test("Returns all issues for empty partial path", () => {
    const issues = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "abc",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "def",
      ),
    ];

    const matchingIssues = filterIssuesByPartialPath([], issues);
    expect(matchingIssues.length).toBe(3);
    expect(matchingIssues).toEqual([issues[0], issues[1], issues[2]]);
  });
});

describe("filterIssuesByPath", () => {
  test("Returns no matching issues for empty input array", () => {
    const issues: SemanticIssue[] = [];

    expect(filterIssuesByPath(["foo"], issues).length).toBe(0);
  });

  test("Returns no matching issues for unknown path", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
    ];

    expect(filterIssuesByPath(["foo"], issues).length).toBe(0);
  });

  test("Returns one matching issue for correct path", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
    ];

    const matchingIssues = filterIssuesByPath(["hello", "world"], issues);
    expect(matchingIssues.length).toBe(1);
    expect(matchingIssues).toEqual([issues[0]]);
  });

  test("Returns one matching issue for correct empty path", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(SemanticIssueType.DUPLICATED_ID, [], "foo"),
    ];

    const matchingIssues = filterIssuesByPath([], issues);
    expect(matchingIssues.length).toBe(1);
    expect(matchingIssues).toEqual([issues[0]]);
  });

  test("Returns no matching issue for issue with empty path but compare path not being empty", () => {
    const issues: SemanticIssue[] = [
      new SemanticIssue(SemanticIssueType.DUPLICATED_ID, [], "foo"),
    ];

    const matchingIssues = filterIssuesByPath(["hello"], issues);
    expect(matchingIssues.length).toBe(0);
  });

  test("Returns multiple matching issues for correct path", () => {
    const issues = [
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "abc",
      ),
      new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["foo", 2, "bar"],
        "def",
      ),
    ];

    const matchingIssues = filterIssuesByPath(["foo", 2, "bar"], issues);
    expect(matchingIssues.length).toBe(2);
    expect(matchingIssues).toEqual([issues[1], issues[2]]);
  });
});
