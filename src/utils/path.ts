import type { Path } from "../types/Path";

/**
 * Checks if the given partialPath fully matches the given path
 * or if the path starts with the given partialPath.
 *
 * Attention: If the given partialPath is empty, this function
 * will always return true.
 *
 * @param partialPath Partial path to use for matching check.
 * @param path Path to be checked against.
 * @return True if the path starts with the given partialPath or fully matches it.
 * Also returns true, if the given partialPath is empty. Returns false in all other cases.
 */
export function matchPathsPartially(partialPath: Path, path: Path): boolean {
  if (partialPath.length > path.length) {
    return false;
  }

  if (partialPath.length === 0) {
    return true;
  }

  for (let i = 0; i < partialPath.length; i++) {
    if (partialPath[i] !== path[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if the given otherPath fully matches the given path.
 *
 * @param otherPath Path to check for.
 * @param path Path to compare otherPath against.
 * @return True if otherPath fully matches the given path, false otherwise.
 */
export function matchPaths(otherPath: Path, path: Path): boolean {
  if (otherPath.length !== path.length) {
    return false;
  }

  return matchPathsPartially(otherPath, path);
}

/**
 * Formats the given path to a JS like accessor string.
 *
 * Examples:
 *  - ["foo", 2, "bar"] becomes "foo[2].bar".
 *  - ["foo", "bar", 0, 42] becomes "foo.bar[0][42]".
 *  - [0, "foo", "bar", 42] becomes "[0].foo.bar[42]".
 *
 * @return Returns the path as a formatted string in JS like accessor syntax.
 */
export function formatPath(path: Path): string {
  let formattedPath = "";

  for (let i = 0; i < path.length; i++) {
    const pathPart = path[i];

    if (typeof pathPart === "number") {
      formattedPath += `[${pathPart}]`;
    } else {
      if (i > 0) {
        formattedPath += ".";
      }
      formattedPath += pathPart;
    }
  }

  return formattedPath;
}
