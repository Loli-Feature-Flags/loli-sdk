import { describe, expect, test } from "@jest/globals";

import { SemanticIssue } from "./SemanticIssue";
import { SemanticIssueType } from "./SemanticIssueType";
import { SemanticValidation } from "./SemanticValidation";

describe("SemanticValidation", () => {
  describe("addIssue & getIssues", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.getIssues()).toEqual([]);
    });

    test("One issue", () => {
      const validation = new SemanticValidation();
      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      expect(validation.getIssues().length).toBe(1);
      expect(validation.getIssues()).toEqual([issue]);
    });

    test("Multiple issues", () => {
      const validation = new SemanticValidation();

      const issues = [
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
        new SemanticIssue(SemanticIssueType.DUPLICATED_ID, [42], "24"),
      ];

      validation.addIssue(...issues);

      expect(validation.getIssues().length).toBe(2);
      expect(validation.getIssues()).toEqual(issues);
    });

    test("Duplicates are not added", () => {
      const validation = new SemanticValidation();
      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);
      validation.addIssue(issue, issue);

      expect(validation.getIssues().length).toBe(1);
      expect(validation.getIssues()).toEqual([issue]);
    });
  });

  describe("isValid", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.isValid()).toEqual(true);
    });

    test("One issue", () => {
      const validation = new SemanticValidation();

      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      expect(validation.isValid()).toEqual(false);
    });

    test("Multiple issues", () => {
      const validation = new SemanticValidation();

      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
        new SemanticIssue(SemanticIssueType.DUPLICATED_ID, [42], "24"),
      );

      expect(validation.isValid()).toEqual(false);
    });
  });

  describe("getIssuesByPath", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.getIssuesByPath(["foo"]).length).toBe(0);
    });

    test("No matching issues", () => {
      const validation = new SemanticValidation();

      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
      );

      expect(validation.getIssuesByPath(["foo"]).length).toBe(0);
    });

    test("One matching issue", () => {
      const validation = new SemanticValidation();

      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      const matchingIssues = validation.getIssuesByPath(["hello", "world"]);
      expect(matchingIssues.length).toBe(1);
      expect(matchingIssues).toEqual([issue]);
    });

    test("Multiple matching issues", () => {
      const validation = new SemanticValidation();

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

      validation.addIssue(...issues);

      const matchingIssues = validation.getIssuesByPath(["foo", 2, "bar"]);
      expect(matchingIssues.length).toBe(2);
      expect(matchingIssues).toEqual([issues[1], issues[2]]);
    });
  });

  describe("getIssuesByPartialPath", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.getIssuesByPartialPath(["foo"]).length).toBe(0);
    });

    test("No matching issues", () => {
      const validation = new SemanticValidation();

      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
      );

      expect(validation.getIssuesByPartialPath(["foo"]).length).toBe(0);
    });

    test("One matching issue", () => {
      const validation = new SemanticValidation();

      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      const matchingIssues = validation.getIssuesByPartialPath(["hello"]);
      expect(matchingIssues.length).toBe(1);
      expect(matchingIssues).toEqual([issue]);
    });

    test("Multiple matching issues", () => {
      const validation = new SemanticValidation();

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

      validation.addIssue(...issues);

      const matchingIssues = validation.getIssuesByPartialPath(["foo", 2]);
      expect(matchingIssues.length).toBe(2);
      expect(matchingIssues).toEqual([issues[1], issues[2]]);
    });
  });

  describe("isValidByPath", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.isValidByPath(["foo"])).toBe(true);
    });

    test("No matching issues", () => {
      const validation = new SemanticValidation();

      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
      );

      expect(validation.isValidByPath([])).toBe(true);
      expect(validation.isValidByPath(["foo"])).toBe(true);
    });

    test("One matching issue", () => {
      const validation = new SemanticValidation();

      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      expect(validation.isValidByPath([])).toBe(true);
      expect(validation.isValidByPath(["hello", "world"])).toBe(false);
      expect(validation.isValidByPath(["hello"])).toBe(true);
    });

    test("Multiple matching issues", () => {
      const validation = new SemanticValidation();

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

      validation.addIssue(...issues);

      expect(validation.isValidByPath([])).toBe(true);
      expect(validation.isValidByPath(["foo", 2, "bar"])).toBe(false);
      expect(validation.isValidByPath(["foo"])).toBe(true);
    });
  });

  describe("isValidByPartialPath", () => {
    test("No issues", () => {
      const validation = new SemanticValidation();

      expect(validation.isValidByPartialPath(["foo"])).toBe(true);
    });

    test("No matching issues", () => {
      const validation = new SemanticValidation();

      validation.addIssue(
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["hello", "world"],
          "foo",
        ),
      );

      expect(validation.isValidByPartialPath([])).toBe(false);
      expect(validation.isValidByPartialPath(["foo"])).toBe(true);
    });

    test("One matching issue", () => {
      const validation = new SemanticValidation();

      const issue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["hello", "world"],
        "foo",
      );

      validation.addIssue(issue);

      expect(validation.isValidByPartialPath([])).toBe(false);
      expect(validation.isValidByPartialPath(["hello", "world"])).toBe(false);
      expect(validation.isValidByPartialPath(["hello"])).toBe(false);
      expect(validation.isValidByPartialPath(["foo"])).toBe(true);
    });

    test("Multiple matching issues", () => {
      const validation = new SemanticValidation();

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

      validation.addIssue(...issues);

      expect(validation.isValidByPartialPath([])).toBe(false);
      expect(validation.isValidByPartialPath(["foo", 2, "bar"])).toBe(false);
      expect(validation.isValidByPartialPath(["foo"])).toBe(false);
      expect(validation.isValidByPartialPath(["blub"])).toBe(true);
    });
  });

  describe("combine", () => {
    test("Two empty validations", () => {
      const left = new SemanticValidation();
      const right = new SemanticValidation();

      const combined = left.combine(right);
      expect(combined.getIssues().length).toBe(0);
    });

    test("One empty validation (left-hand)", () => {
      const left = new SemanticValidation();
      const right = new SemanticValidation();

      const rightIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["right"],
        "issue",
      );

      right.addIssue(rightIssue);

      const combined = left.combine(right);
      const combinedIssues = combined.getIssues();
      expect(combinedIssues.length).toBe(1);
      expect(combinedIssues[0]).toBe(rightIssue);
    });

    test("One empty validation (right-hand)", () => {
      const left = new SemanticValidation();
      const right = new SemanticValidation();

      const leftIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["left"],
        "issue",
      );

      left.addIssue(leftIssue);

      const combined = left.combine(right);
      const combinedIssues = combined.getIssues();
      expect(combinedIssues.length).toBe(1);
      expect(combinedIssues[0]).toBe(leftIssue);
    });

    test("Two non-empty validations", () => {
      const left = new SemanticValidation();
      const right = new SemanticValidation();

      const leftIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["left"],
        "issue",
      );

      left.addIssue(leftIssue);

      const rightIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["right"],
        "issue",
      );

      right.addIssue(rightIssue);

      const combined = left.combine(right);
      const combinedIssues = combined.getIssues();
      expect(combinedIssues.length).toBe(2);
      expect(combinedIssues).toEqual([leftIssue, rightIssue]);
    });

    test("Duplicates get removed", () => {
      const left = new SemanticValidation();
      const right = new SemanticValidation();

      const leftIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["left"],
        "issue",
      );

      const rightIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["right"],
        "issue",
      );

      left.addIssue(leftIssue);
      left.addIssue(rightIssue);

      right.addIssue(rightIssue);
      right.addIssue(leftIssue);

      const combined = left.combine(right);
      const combinedIssues = combined.getIssues();
      expect(combinedIssues.length).toBe(2);
      expect(combinedIssues).toEqual([leftIssue, rightIssue]);
    });

    test("Combining multiple other validations", () => {
      const left = new SemanticValidation();
      const rightOne = new SemanticValidation();
      const rightTwo = new SemanticValidation();

      const leftIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["left"],
        "issue",
      );

      const rightOneIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["rightOne"],
        "issue",
      );

      const rightTwoIssue = new SemanticIssue(
        SemanticIssueType.DUPLICATED_ID,
        ["rightOne"],
        "issue",
      );

      left.addIssue(leftIssue);
      rightOne.addIssue(rightOneIssue);
      rightTwo.addIssue(rightTwoIssue);

      const combined = left.combine(rightOne, rightTwo);
      const combinedIssues = combined.getIssues();
      expect(combinedIssues.length).toBe(3);
      expect(combinedIssues).toEqual([leftIssue, rightOneIssue, rightTwoIssue]);
    });
  });

  describe("toString", () => {
    test("Empty validation", () => {
      const validation = new SemanticValidation();

      expect(validation.toString()).toBe("No issues");
    });

    test("One issue", () => {
      const validation = new SemanticValidation();

      const issues = [
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["abc", 0, "def"],
          "one",
        ),
      ];

      validation.addIssue(...issues);

      expect(validation.toString()).toBe(
        "Issues: (DUPLICATED_ID) abc[0].def: one",
      );
    });

    test("Two issues", () => {
      const validation = new SemanticValidation();

      const issues = [
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["abc", 0, "def"],
          "one",
        ),
        new SemanticIssue(
          SemanticIssueType.DUPLICATED_ID,
          ["uvw", 1, "xyz"],
          "two",
        ),
      ];

      validation.addIssue(...issues);

      expect(validation.toString()).toBe(
        "Issues: (DUPLICATED_ID) abc[0].def: one; (DUPLICATED_ID) uvw[1].xyz: two",
      );
    });
  });
});
