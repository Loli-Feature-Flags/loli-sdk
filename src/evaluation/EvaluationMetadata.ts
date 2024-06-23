import type { EvaluationWarningLogger } from "./EvaluationWarningLogging";

export type EvaluationMetadata = {
  evaluationDateTime: Date;

  /**
   * Floating point number between 0 and 100.
   * This determines what values are returned
   * if a feature flag has multiple values
   * (gradual rollout or random A/B testing).
   */
  rolloutGroup: number;

  warningLogger?: EvaluationWarningLogger;
};
