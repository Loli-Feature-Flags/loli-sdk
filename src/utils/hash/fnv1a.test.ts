import { describe, expect, test } from "@jest/globals";

import { fnv1a } from "./fnv1a";

describe("fnv1a", () => {
  test("Returns a positive number", () => {
    for (let i = 0; i < 10000; i++) {
      const input = `${new Date().getTime()}–${Math.random()}`;
      const hash = fnv1a(input);
      expect(hash >= 0).toBe(true);
    }
  });

  test("Returns number in a specified range", () => {
    const min = -40;
    const max = 342;

    for (let i = 0; i < 10000; i++) {
      const input = `${new Date().getTime()}–${Math.random()}`;
      const hash = fnv1a(input, { range: { min, max } });
      expect(hash >= min).toBe(true);
      expect(hash <= max).toBe(true);
    }
  });

  test("Returns evenly distributed hash numbers", () => {
    const min = 0;
    const max = 100;
    const sampleSize = 2_000_000;
    const histogram: Record<number, number> = {};

    for (let i = 0; i < sampleSize; ++i) {
      const input = `${new Date().getTime()}–${Math.random()}`;
      const hash = fnv1a(input, { range: { min, max } });
      histogram[hash] = (histogram[hash] || 0) + 1;
    }

    const range = max - min + 1;
    const expectedBinSize = sampleSize / range;
    const maxDifferencePercentage = 0.01; // very acceptable for the given sample size

    let averageDifference = 0;

    for (let binIndex = min; binIndex <= max; ++binIndex) {
      const difference = Math.abs(histogram[binIndex] - expectedBinSize);

      averageDifference += difference;
    }

    const averageDifferencePercentage =
      averageDifference / range / expectedBinSize;

    console.log(
      `Max allowed difference = ${(maxDifferencePercentage * 100).toFixed(2)}% – Average difference = ${(averageDifferencePercentage * 100).toFixed(2)}%`,
    );

    expect(averageDifferencePercentage).toBeLessThanOrEqual(
      maxDifferencePercentage,
    );
  });

  test("Returns a hash for an empty input string", () => {
    expect(typeof fnv1a("")).toBe("number");
  });

  test("Returns same hashes for same inputs deterministically", () => {
    const inputs: string[] = [
      "aksjdhbaskld",
      "9a6sdg98asd",
      "",
      "oas7zd87asd",
      "asdasdasd",
      "9as7d9asd",
    ];

    // Computed once when the function and this test was written based on the input array above/below:
    // ["aksjdhbaskld","9a6sdg98asd","","oas7zd87asd","asdasdasd","9as7d9asd"]
    // This way we make sure, that any library update will never change
    // suddenly any rollout distributions.
    const expectedHashes: number[] = [
      4155771284, 2879955044, 2166136261, 3192612176, 3941384472, 395933564,
    ];

    for (let i = 0; i < 100; i++) {
      const roundHashes = inputs.map((input) => fnv1a(input));
      expect(roundHashes).toEqual(expectedHashes);
    }
  });
});
