import type { Path } from "../../types/Path";
import { formatPath, matchPaths, matchPathsPartially } from "../../utils/path";
import type { SemanticIssueType } from "./SemanticIssueType";

/**
 * SemanticIssue instances shall be used to
 * store information about any semantic issue of a LoliSpec.
 *
 * The path determines to which attribute in the LoliSpec the
 * issue belongs to. Type and message help to better understand
 * and identify the issue.
 */
export class SemanticIssue {
  /**
   * Creates a new issue instance and stores the given parameters.
   *
   * @param type Type of new issue.
   * @param path Path of new issue.
   * @param message Message of new issue.
   */
  constructor(
    public readonly type: SemanticIssueType,
    public readonly path: Path,
    public readonly message: string,
  ) {}

  /**
   * Convenience function for: matchSpecPathsPartially(otherPartialPath, this.path)
   *
   * @param otherPartialPath Partial path to use for matching check.
   * @return True if the path of this issue starts with the given path or fully matches it.
   * Also returns true, if the given partial path is empty. Returns false in all other cases.
   */
  matchesByPartialPath(otherPartialPath: Path) {
    return matchPathsPartially(otherPartialPath, this.path);
  }

  /**
   * Convenience function for: matchSpecPaths(otherPath, this.path)
   *
   * @param otherPath Path to be compared against this issue's path.
   * @return True if this issue's path fully matches the given one, false otherwise.
   */
  matchesByPath(otherPath: Path): boolean {
    return matchPaths(otherPath, this.path);
  }

  /**
   * Convenience method for: formatSpecPath(this.path)
   *
   * @returns Returns the path of this issue formatted in a JS like accessor syntax.
   */
  pathToString(): string {
    return formatPath(this.path);
  }

  /**
   * Formats the issue as a string including type, formatted path and message.
   *
   * @returns Issue as a formatted string.
   */
  toString(): string {
    return `(${this.type.toString()}) ${this.pathToString()}: ${this.message}`;
  }
}
