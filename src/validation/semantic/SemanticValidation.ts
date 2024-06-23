import type { Path } from "../../types/Path";
import {
  filterIssuesByPartialPath,
  filterIssuesByPath,
} from "../../utils/issues";
import type { SemanticIssue } from "./SemanticIssue";

/**
 * SemanticValidation instances shall be used to hold
 * a group of SemanticIssues and perform meta functions/checks
 * on them.
 *
 * The class offers utility functions to retrieve all issues
 * by a specific (partial) path. It also offers
 * methods to check for semantic validity (overall or by full/partial paths).
 *
 * A SemanticValidation instance essentially represents
 * the semantic validity check result of a LoliSpec.
 */
export class SemanticValidation {
  private issues: SemanticIssue[] = [];

  /**
   * Creates a new instance.
   */
  constructor() {}

  /**
   * Adds all the given issues. If one of the given issues
   * already exists (by reference), it will not be added again.
   *
   * @param issues Issues to be added.
   */
  addIssue(...issues: SemanticIssue[]) {
    for (const newIssue of issues) {
      if (!this.issues.includes(newIssue)) {
        this.issues.push(newIssue);
      }
    }
  }

  /**
   * Returns all issues.
   *
   * @return Array of all issues.
   */
  getIssues() {
    return this.issues;
  }

  /**
   * Checks if there are any issues or not.
   * Convenience method for getIssues().length === 0.
   *
   * @return Returns true if there are no issues, otherwise false.
   */
  isValid() {
    return this.issues.length === 0;
  }

  /**
   * TODO
   * @param path
   */
  getIssuesByPath(path: Path): SemanticIssue[] {
    return filterIssuesByPath(path, this.issues);
  }

  /**
   * TODO
   * @param partialPath
   */
  getIssuesByPartialPath(partialPath: Path): SemanticIssue[] {
    return filterIssuesByPartialPath(partialPath, this.issues);
  }

  /**
   * Checks if there are any issues that match the given path.
   * Convenience method for getIssuesByPath(path).length === 0.
   *
   * @param path Path used to retrieve/check issues for.
   * @return Returns true if there are no issues matching the given path, false otherwise.
   */
  isValidByPath(path: Path) {
    return this.getIssuesByPath(path).length === 0;
  }

  /**
   * Checks if there are any issues that partially or fully match the given path.
   * Convenience method for getIssuesByPartialPath(path).length === 0.
   *
   * @param path Path used to retrieve/check issues for.
   * @return Returns true if there are no issues matching the given partial path, false otherwise.
   */
  isValidByPartialPath(path: Path) {
    return this.getIssuesByPartialPath(path).length === 0;
  }

  /**
   * Combines two SemanticValidation instances. This function
   * creates a complete new instance and first adds all issues
   * of this validation to the new one, and then all issues
   * of the given "other" validation to the new combined one.
   *
   * Duplicates (by reference) are removed.
   *
   * @param others Other SemanticValidation instances.
   * @return New SemanticValidation instance with all unique issues from this and other.
   */
  combine(...others: SemanticValidation[]): SemanticValidation {
    const combinedValidation = new SemanticValidation();

    combinedValidation.addIssue(...this.issues);

    for (const otherValidation of others) {
      combinedValidation.addIssue(...otherValidation.getIssues());
    }

    return combinedValidation;
  }

  /**
   * Creates a string with all issues' messages/texts.
   * @return Description with all issues' messages/texts.
   */
  toString(): string {
    if (this.issues.length === 0) {
      return "No issues";
    }

    return `Issues: ${this.issues.map((issue) => issue.toString()).join("; ")}`;
  }
}
