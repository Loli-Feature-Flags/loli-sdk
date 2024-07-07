import type { EvaluationWarningLogger } from "../evaluation/EvaluationWarningLogging";
import type { LoliSpec } from "../schema/LoliSpec";

export type LoliClientSpecLoader = () => Promise<string | object>;

export type LoliClientEvaluationEmergencyFallbacks = {
  boolean: boolean;
  number: number;
  string: string;
};

export type LoliClientAllFeatureFlagsEvaluationResult = Record<
  string,
  boolean | number | string | undefined
>;

export type LoliClientDataTypeMismatchBehavior = "emergency-fallback" | "error";

export type LoliClientCallbackBehavior = "blocking" | "non-blocking";

export type LoliClientOptions = {
  specLoaderTimeoutMilliseconds?: number;
  specLoaderMaxRetries?: number;
  specLoaderFailureRetryDelayMilliseconds?: number;
  specCacheStaleTimeMilliseconds?: number;
  specReloadMaxBlockingWaitMilliseconds?: number;
  disableInitialSpecLoadOnCreation?: boolean;
  emergencyFallbacksByFeatureFlagName?: LoliClientAllFeatureFlagsEvaluationResult;
  emergencyFallbacksByDataType?: LoliClientEvaluationEmergencyFallbacks;
  dataTypeMismatchBehavior?: LoliClientDataTypeMismatchBehavior;
  callbackBehavior?: LoliClientCallbackBehavior;
};

export type LoliClientCallbacks = {
  specLoaderFailure?: (message: string, cause?: unknown) => void;
  specValidationFailure?: (
    message: string,
    loaded: unknown,
    casue?: unknown,
  ) => void;
  specLoadedAndValidated?: (loadedSpec: LoliSpec) => void;
  emergencyFallbackUsed?: (message: string, cause?: unknown) => void;
  evaluationWarning?: EvaluationWarningLogger;
};
