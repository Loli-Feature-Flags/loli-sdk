export type EvaluationWarningType =
  | "property-value-not-found"
  | "property-value-incorrect-data-type";

export type EvaluationWarningLogger = (
  type: EvaluationWarningType,
  message: string,
) => void;
