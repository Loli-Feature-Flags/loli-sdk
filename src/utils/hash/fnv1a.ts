const fnv1aOffsetBasis = 2166136261;
const fnv1aPrime = 16777619;

export type FNV1AOptions = {
  offsetBasis?: number;
  prime?: number;
  range?: {
    min: number;
    max: number;
  };
};

export function fnv1a(input: string, options?: FNV1AOptions): number {
  const {
    offsetBasis = fnv1aOffsetBasis,
    prime = fnv1aPrime,
    range,
  } = options ?? {};

  let hash = offsetBasis;

  for (let i = 0; i < input.length; ++i) {
    hash = (hash * prime) ^ input.charCodeAt(i);
  }

  hash = hash >>> 0;

  if (range) {
    hash = (hash % (range.max - range.min + 1)) + range.min;
  }

  return hash;
}
