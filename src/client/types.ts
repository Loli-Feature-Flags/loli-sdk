import type { LoliError } from "../errors/LoliError";
import type { EvaluationWarningLogger } from "../evaluation/EvaluationWarningLogging";
import type { LoliSpec } from "../schema/LoliSpec";

export type LoliClientSpecLoaderValidatorResult =
  | {
      state: "valid-spec-loaded";

      /**
       * The loaded and validated specification the
       * {@link LoliClient} will use to perform evaluations.
       */
      loadedAndValidatedSpec: LoliSpec;
    }
  | {
      state: "invalid-spec-loaded";

      /**
       * The loaded but invalid data.
       */
      loadedData: unknown;

      /**
       * The Loli validation error.
       */
      error: LoliError<never>;
    };

export type LoliClientSpecLoaderValidatorOptions = {
  /**
   * This validator callback is called when the validator
   * determined the data loaded by the spec loader as invalid.
   *
   * @param loadedData Data the spec loader passed to the validator.
   */
  receivedInvalidData?: (
    loadedData: unknown,
    error: LoliError<never>,
  ) => Promise<void> | void;

  /**
   * This validator callback is called when the validator
   * determined the data loaded by the spec loader as valid.
   *
   * @param loliSpec The loaded and validated spec.
   */
  receivedValidSpec?: (loliSpec: LoliSpec) => Promise<void> | void;

  /**
   * This is an optional object holding
   * options that are only intended for advanced use cases.
   *
   * Default value: {} (empty object)
   */
  _dangerous?: {
    /**
     * If this is set to true, the validator will skip schema and semantic validation
     * and essentially assume the data the spec loader passes is valid.
     *
     * WARNING: Use that only for advanced use cases when you can guarantee
     * that the returned data is valid. If the returned data is not valid,
     * this could lead to unwanted effects. Client evaluation will continue to work,
     * but always return emergency fallback values.
     */
    assumeDataIsValidSpec?: boolean;
  };
};

export type LoliClientSpecLoaderValidator = (
  loadedData: string | object,
  options?: LoliClientSpecLoaderValidatorOptions,
) => Promise<LoliClientSpecLoaderValidatorResult>;

export type LoliClientSpecLoader = (
  validator: LoliClientSpecLoaderValidator,
) => Promise<LoliClientSpecLoaderValidatorResult>;

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
  /**
   * The time in milliseconds the client waits for a call to the
   * spec loader to return. If this timeout duration is exceeded by
   * the spec loader, the client assumes the call to have failed with
   * a timeout. Depending on the configuration of the client, it
   * might perform a retry.
   *
   * Default value: 15000ms (15s)
   */
  specLoaderTimeoutMilliseconds?: number;

  /**
   * If this option is > 0, the client performs retries if the
   * (initial) spec loader call fails or times out.
   * The max. number of spec loader calls is 1 + specLoaderMaxRetries.
   *
   * Default value: 5 (retries)
   */
  specLoaderMaxRetries?: number;

  /**
   * The time to wait between the last spec loader call attempt
   * and the next one (a retry) in milliseconds.
   *
   * Default value: 2500ms (2.5s)
   */
  specLoaderFailureRetryDelayMilliseconds?: number;

  /**
   * This option controls after how much time in milliseconds
   * a successfully loaded and validated Loli specification
   * is seen as "stale".
   *
   * Until a spec is stale, no automatic reload
   * is triggered by the client. When the cached spec is becomes/is seen
   * as stale, the client will automatically trigger a spec reload
   * on spec reads (e.g. evaluation calls).
   *
   * Default value: 15000ms (15s)
   */
  specCacheStaleTimeMilliseconds?: number;

  /**
   * The time in milliseconds to wait for a spec reload if the cached
   * spec is stale.
   *
   * If this is <= 0, all actions accessing the cached spec
   * will not be "blocked" by any reloads.
   *
   * If this option is > 0, all actions accessing the cached and stale spec
   * will wait for up to "specReloadMaxBlockingWaitMilliseconds". If the spec
   * loader returned within that time, the actions will already use
   * the newly fetched spec, otherwise they will continue to use the stale spec.
   *
   * The reload is not affected by that in any way and will finish either way.
   *
   * Default value: 1500ms (1.5s)
   */
  specReloadMaxBlockingWaitMilliseconds?: number;

  /**
   * By default, a LoliClient call the spec loader during the instance
   * initialization. If you don't want this and instead want the client
   * to first load the spec on the first evaluation call, you can set
   * this option to true.
   *
   * Default value: false
   */
  disableInitialSpecLoadOnCreation?: boolean;

  /**
   * In case the client is running in emergency mode (no spec available),
   * evaluation actions will first try to return an emergency fallback value
   * based on the feature flag name. Via this option you can define emergency
   * fallback values by feature flag name.
   *
   * This is relevant for an "all feature flags" evaluation and single/per-data-type
   * evaluation calls.
   *
   * Default value: {} (empty object)
   */
  emergencyFallbacksByFeatureFlagName?: LoliClientAllFeatureFlagsEvaluationResult;

  /**
   * In case the client is running in emergency mode (no spec available),
   * single feature flag evaluation actions will first try to return an emergency
   * fallback value by the feature flag name and the option
   * "emergencyFallbacksByFeatureFlagName".
   *
   * If no emergency fallback value is set by the name, this option comes into play.
   * The single feature flag evaluation actions will then return a fallback value based
   * on the expected output data type.
   *
   * This option is not relevant for an "all feature flags" evaluation.
   *
   * Default value: { boolean: false, number: 0, string: "" }
   */
  emergencyFallbacksByDataType?: LoliClientEvaluationEmergencyFallbacks;

  /**
   * This option controls what happens, when a single feature flag evaluation
   * is executed, but the data type of the feature flag specification does not match
   * the signature of the evaluation method.
   *
   * Example: evaluateNumberFeatureFlag is called for a feature flag, which
   * has the output data type "boolean" in the loaded specification.
   *
   * The value "emergency-fallback" returns the corresponding emergency fallback
   * value by data type based on the evaluation function signature
   * (see option "emergencyFallbacksByDataType").
   *
   * The value "error" causes the client to instead throw an error. The evaluation
   * function will also return an error respectively return a rejected promise.
   *
   * Default value: "emergency-fallback"
   */
  dataTypeMismatchBehavior?: LoliClientDataTypeMismatchBehavior;

  /**
   * This option defines how/when client callbacks are executed.
   *
   * The value "non-blocking" causes all callbacks to be executed via
   * a setTimeout with a timeout duration of 0 milliseconds.
   *
   * The value "blocking" causes all callbacks to be called directly/"in place"
   * surrounded by a try/catch to not break any client logic.
   *
   * It is always guaranteed, that failing callbacks never break
   * any client logic.
   *
   * Default value: "non-blocking"
   */
  callbackBehavior?: LoliClientCallbackBehavior;
};

export type LoliClientCallbacks = {
  /**
   * This callback is executed when the spec loader throws an error/returns
   * with a rejected promise.
   *
   * @param message Failure message.
   * @param cause Optional cause.
   */
  specLoaderFailure?: (message: string, cause?: unknown) => void;

  /**
   * This callback is executed when the spec loader validator
   * executes (if specified) one of its callbacks and detects that they
   * throw an error.
   *
   * @param message Failure message.
   * @param cause Optional cause.
   */
  specLoaderValidatorCallbackFailure?: (
    message: string,
    cause?: unknown,
  ) => void;

  /**
   * This callback is executed after the spec loader successfully returned
   * something, but the result is invalid JSON or a Loli specification with
   * an invalid schema or with semantic issues.
   *
   * @param message Failure message.
   * @param specLoaderResult Result of the spec loader that was invalid JSON or a spec with an invalid schema or semantic issues.
   * @param cause Optional cause.
   */
  specValidationFailure?: (
    message: string,
    specLoaderResult: unknown,
    cause?: unknown,
  ) => void;

  /**
   * This callback is executed when a spec loader successfully returned a result
   * and the result was a valid Loli specification.
   *
   * The callback can be used to e.g. put the loaded and validated Loli specification
   * in a distributed cache.
   *
   * @param loadedSpec Loaded and validated LoliSpec.
   */
  specLoadedAndValidated?: (loadedSpec: LoliSpec) => void;

  /**
   * This callback is executed whenever the client acts in emergency mode
   * and has to make use of an emergency fallback (see options
   * "emergencyFallbacksByFeatureFlagName" and "emergencyFallbacksByDataType").
   *
   * @param message Message that contains information about the use of an emergency fallback.
   * @param cause Optional cause.
   */
  emergencyFallbackUsed?: (message: string, cause?: unknown) => void;

  /**
   * This callback is executed whenever any of the SDKs evaluation functions
   * (e.g. to evaluate feature flags, segments, conditions, etc.) detect
   * a runtime problem (like a data type mismatch between an evaluation context
   * property and the defined data type of that property in the Loli specification).
   *
   * @param type Type of the evaluation warning.
   * @param message Descriptive message of the evaluation warning.
   */
  evaluationWarning?: EvaluationWarningLogger;
};
