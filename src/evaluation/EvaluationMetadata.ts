import type { EvaluationWarningLogger } from "./EvaluationWarningLogging";

export type EvaluationMetadata = {
  /**
   * The date time to use for evaluating
   * date time conditions that use this date time
   * as "now".
   */
  evaluationDateTime: Date;

  /**
   * Floating point number between 0 and 100.
   * This determines what values are returned
   * if a feature flag has multiple values
   * (gradual rollout or random A/B testing).
   */
  rolloutGroup: number;

  /**
   * An optional evaluation cache (a simple map).
   * If specified, it is used to prevent evaluating
   * already evaluated segments again.
   *
   * If it is not specified, segments are always
   * (re)-evaluated when needed.
   *
   * Maps segment IDs to evaluated values for
   * already evaluated segments.
   */
  segmentEvaluationCache?: Map<string, boolean>;

  /**
   * An optional logger for evaluation warnings.
   */
  warningLogger?: EvaluationWarningLogger;
};
