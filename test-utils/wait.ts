/**
 * Waits for a specified amount of time (in milliseconds) before resolving.
 *
 * @param ms The number of milliseconds to wait.
 * @returns A Promise that resolves after the specified timeout has expired.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
