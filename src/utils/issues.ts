import type { Path } from "../types/Path";
import type { SemanticIssue } from "../validation/semantic/SemanticIssue";
import { matchPaths, matchPathsPartially } from "./path";

/**
 * Filters the given issues. Only returns issues
 * that have a path partially or fully matching the
 * given partialPath.
 *
 * Attention: If an empty partialPath array is given, all given issues
 * match the empty partialPath as all issues share the "empty path" – kind of.
 *
 * @param partialPath Partial path acting as a filter.
 * @param issues Issues to filter.
 * @returns Returns issues that have a partially or fully matching path.
 */
export function filterIssuesByPartialPath(
  partialPath: Path,
  issues: SemanticIssue[],
): SemanticIssue[] {
  return issues.filter((issue) => matchPathsPartially(partialPath, issue.path));
}

/**
 * Filters the given issues. Only returns issues
 * that have a path fully matching the
 * given path.
 *
 * Attention: If an empty path is given, only issues
 * with an empty path are returned.
 *
 * @param path Partial path acting as a filter.
 * @param issues Issues to filter.
 * @returns Returns issues that have a fully matching path.
 */
export function filterIssuesByPath(
  path: Path,
  issues: SemanticIssue[],
): SemanticIssue[] {
  return issues.filter((issue) => matchPaths(path, issue.path));
}
