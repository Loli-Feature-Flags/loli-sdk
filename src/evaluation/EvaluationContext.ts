export type EvaluationContextValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | null
  | undefined;

export type EvaluationContext = {
  [key: string]: EvaluationContext | EvaluationContextValue;
};
