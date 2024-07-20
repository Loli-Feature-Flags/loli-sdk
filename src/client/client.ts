import { LoliError } from "../errors/LoliError";
import type { EvaluationContext } from "../evaluation/EvaluationContext";
import type { EvaluationMetadata } from "../evaluation/EvaluationMetadata";
import { evaluateFeatureFlag } from "../evaluation/featureFlag";
import { computeRolloutGroup } from "../evaluation/rollout/rolloutGroup";
import { deserializeLoliSpecFromJson } from "../io/json";
import type { BooleanFeatureFlag } from "../schema/featureFlags/BooleanFeatureFlag";
import type {
  FeatureFlag,
  FeatureFlagOutput,
} from "../schema/featureFlags/FeatureFlag";
import type { NumberFeatureFlag } from "../schema/featureFlags/NumberFeatureFlag";
import type { StringFeatureFlag } from "../schema/featureFlags/StringFeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import type { MakeRequired } from "../types/MakeRequired";
import { getFeatureFlagFromLoliSpecByName } from "../utils/entities";
import { assertValidLoliSpecSchema } from "../validation/schema";
import { assertSemanticallyValidLoliSpec } from "../validation/semantic/areas/combined";
import type {
  LoliClientAllFeatureFlagsEvaluationResult,
  LoliClientCallbacks,
  LoliClientOptions,
  LoliClientSpecLoader,
  LoliClientSpecLoaderValidator,
  LoliClientSpecLoaderValidatorResult,
} from "./types";

export function createDefaultLoliClientOptions(): Readonly<
  Required<LoliClientOptions>
> {
  return Object.freeze({
    specLoaderTimeoutMilliseconds: 15000, // 15s
    specLoaderMaxRetries: 5,
    specLoaderFailureRetryDelayMilliseconds: 2500, // 2.5s
    specCacheStaleTimeMilliseconds: 15000, // 15s
    specReloadMaxBlockingWaitMilliseconds: 1500, // 1.5s
    disableInitialSpecLoadOnCreation: false,
    emergencyFallbacksByFeatureFlagName: {},
    emergencyFallbacksByDataType: {
      boolean: false,
      number: 0,
      string: "",
    },
    dataTypeMismatchBehavior: "emergency-fallback",
    callbackBehavior: "non-blocking",
  });
}

export function createDefaultLoliClientCallbacks(): Readonly<
  MakeRequired<
    LoliClientCallbacks,
    Exclude<keyof LoliClientCallbacks, "specLoadedAndValidated">
  >
> {
  return Object.freeze({
    specLoaderFailure: (message, cause) => {
      console.error(message, cause);
    },
    specLoaderValidatorCallbackFailure: (message, cause) => {
      console.error(message, cause);
    },
    specValidationFailure: (message, specLoaderResult, cause) => {
      console.error(message, specLoaderResult, cause);
    },
    emergencyFallbackUsed: (message, cause) => {
      console.error(message, cause);
    },
    evaluationWarning: (type, message) => {
      console.warn(`Evaluation warning: ${message} [${type}]`);
    },
  });
}

/**
 * A LoliClient can be used to evaluate feature flags in a very simple way.
 * Essentially the client only requires a loader function it can call
 * to get the LoliSpec which defines all feature flags, properties, and segments.
 *
 * Check out the constructor docs for more detials.
 */
export class LoliClient {
  private readonly options: Required<LoliClientOptions>;
  private readonly callbacks: MakeRequired<
    LoliClientCallbacks,
    Exclude<keyof LoliClientCallbacks, "specLoadedAndValidated">
  >;

  private currentLoadPromise: Promise<void> | null = null;

  private loliSpec: LoliSpec | null = null;
  private loliSpecLoadedTimestamp: Date | null = null;
  private loliSpecLoadFailureTimestamp: Date | null = null;

  /**
   * Creates a new LoliClient instance and triggers the initial
   * spec loading, if it is not disabled via the options.
   *
   * @param specLoader Loader function the client can use to get the stringified JSON LoliSpec or the LoliSpec as an object.
   *                   Gets a validator function as an argument and has to call it with the loaded data and return the validator's result.
   * @param options Optional options to tweak the client behaviour.
   * @param callbacks Optional callbacks to get notified about loaded specs and issues.
   */
  constructor(
    private readonly specLoader: LoliClientSpecLoader,
    options?: LoliClientOptions,
    callbacks?: LoliClientCallbacks,
  ) {
    this.options = {
      ...createDefaultLoliClientOptions(),
      ...options,
    };

    const rawCallbacks = {
      ...createDefaultLoliClientCallbacks(),
      ...callbacks,
    };

    // eslint-disable-next-line @typescript-eslint/ban-types
    const wrapCallback = <T extends Function>(func: T) => {
      return (...parameters: unknown[]) => {
        if (this.options.callbackBehavior === "blocking") {
          try {
            func.call(null, ...parameters);
          } catch (error) {
            /* ignore */
          }
        } else {
          setTimeout(() => {
            func.call(null, ...parameters);
          }, 0);
        }
      };
    };

    this.callbacks = {
      specLoaderFailure: wrapCallback(rawCallbacks.specLoaderFailure),
      specLoaderValidatorCallbackFailure: wrapCallback(
        rawCallbacks.specLoaderValidatorCallbackFailure,
      ),
      specValidationFailure: wrapCallback(rawCallbacks.specValidationFailure),
      specLoadedAndValidated:
        rawCallbacks.specLoadedAndValidated &&
        wrapCallback(rawCallbacks.specLoadedAndValidated),
      emergencyFallbackUsed: wrapCallback(rawCallbacks.emergencyFallbackUsed),
      evaluationWarning: wrapCallback(rawCallbacks.evaluationWarning),
    };

    if (!this.options.disableInitialSpecLoadOnCreation) {
      void this.loadAndValidateLoliSpec();
    }
  }

  /**
   * This method creates a new "validator" function that can be passed to a spec loader.
   * This function return an object holding the new validator function and a utility function
   * to check if a spec loader result was produced by the corresponding validator function
   * to enforce zero trust.
   *
   * @returns Returns object with validator function and utility functions to assert that spec loader results have been created by the validator.
   */
  private createValidator(): {
    validator: LoliClientSpecLoaderValidator;
    didValidatorProduceResult: (
      result: LoliClientSpecLoaderValidatorResult,
    ) => boolean;
  } {
    const producedResults: Set<LoliClientSpecLoaderValidatorResult> = new Set();

    function didValidatorProduceResult(
      result: LoliClientSpecLoaderValidatorResult,
    ): boolean {
      return producedResults.has(result);
    }

    function produceResult(
      result: LoliClientSpecLoaderValidatorResult,
    ): LoliClientSpecLoaderValidatorResult {
      const frozenResult = Object.freeze({
        ...result,
        ...("loadedAndValidatedSpec" in result
          ? {
              loadedAndValidatedSpec: Object.freeze(
                result.loadedAndValidatedSpec,
              ),
            }
          : {}),
        ...("loadedData" in result
          ? {
              loadedAndValidatedSpec: Object.freeze(result.loadedData),
            }
          : {}),
      } as LoliClientSpecLoaderValidatorResult);

      producedResults.add(frozenResult);

      return frozenResult;
    }

    const callbacks = this.callbacks;

    const validator: LoliClientSpecLoaderValidator = async function (
      loadedData,
      options,
    ) {
      if (
        loadedData === undefined ||
        loadedData === null ||
        (typeof loadedData !== "string" && typeof loadedData !== "object") ||
        Array.isArray(loadedData)
      ) {
        throw new Error(
          `The result of the spec loader was neither a string nor an object. Type = ${typeof loadedData}, is array = ${Array.isArray(loadedData)}`,
        );
      }

      try {
        if (options?._dangerous?.assumeDataIsValidSpec) {
          return produceResult({
            state: "valid-spec-loaded",
            loadedAndValidatedSpec:
              typeof loadedData === "string"
                ? (JSON.parse(loadedData) as LoliSpec)
                : (loadedData as LoliSpec),
          });
        } else {
          const loadedAndValidatedSpec = Object.freeze(
            typeof loadedData === "string"
              ? deserializeLoliSpecFromJson(loadedData)
              : assertSemanticallyValidLoliSpec(
                  assertValidLoliSpecSchema(loadedData),
                ),
          );

          if (options?.receivedValidSpec) {
            try {
              await options.receivedValidSpec(loadedAndValidatedSpec);
            } catch (validatorCallbackError) {
              callbacks?.specLoaderValidatorCallbackFailure(
                `The validator callback "receivedValidSpec" failed. Error: ${validatorCallbackError}`,
                validatorCallbackError,
              );
            }
          }

          return produceResult({
            state: "valid-spec-loaded",
            loadedAndValidatedSpec: loadedAndValidatedSpec,
          });
        }
      } catch (error) {
        if (error instanceof LoliError) {
          if (options?.receivedInvalidData) {
            try {
              await options.receivedInvalidData(
                loadedData,
                error as LoliError<never>,
              );
            } catch (validatorCallbackError) {
              callbacks?.specLoaderValidatorCallbackFailure(
                `The validator callback "receivedInvalidData" failed. Error: ${validatorCallbackError}`,
                validatorCallbackError,
              );
            }
          }

          return produceResult({
            state: "invalid-spec-loaded",
            loadedData,
            error: error as LoliError<never>,
          });
        }

        throw error;
      }
    };

    return {
      validator,
      didValidatorProduceResult,
    };
  }

  /**
   * This method uses the defined specLoader to load the LoliSpec to be used
   * for the feature flag evaluation.
   *
   * If this method is called while a previous call is still in running and waiting to finish,
   * then the current call will "join" the progress of the previous call and resolve once the original
   * call resolves.
   *
   * The following steps are performed:
   *  - (1 + options.specLoaderMaxRetries) many times:
   *    - call specLoader (timeout activated if options.specLoaderTimeoutMilliseconds >= 0)
   *    - use loader result to validate schema of loaded spec
   *    - validate spec semantically
   *    - store validated spec in this.loliSpec
   *    - set this.loliSpecTimestamp to now
   *    - on success return early
   *    - on failure -> next attempt
   *
   * If the specLoader fails or times out, the callback specLoaderFailure is executed.
   * If some validation fails, the callback specValidationFailure is executed.
   *
   * On load and validation success, the callback specLoadedAndValidated is executed, if specified.
   *
   * @returns Returns a promise that resolves once the loading successfully finished or failed after all retries. The promise will never reject.
   */
  private async loadAndValidateLoliSpec(): Promise<void> {
    // Optimization: This ensures that the spec never loaded in parallel.
    if (this.currentLoadPromise) {
      return this.currentLoadPromise;
    }

    // Set up a promise that concurrent calls to this function can return.
    // We consciously never reject, as the calling method does not expect any
    // result. The calling method has to determine of this.loliSpec is defined or null.
    let currentLoadPromiseResolve: () => void = () => undefined;

    this.currentLoadPromise = new Promise<void>((resolve) => {
      currentLoadPromiseResolve = resolve;
    });

    // Global try/finally to catch any errors and in the end resolve the loading promise.
    try {
      loadAttempts: for (
        let loadAttempt = 0;
        loadAttempt < 1 + this.options.specLoaderMaxRetries; // At least one attempt
        loadAttempt++
      ) {
        // Retry -> wait
        if (loadAttempt >= 1) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              this.options.specLoaderFailureRetryDelayMilliseconds,
            ),
          );
        }

        // Spec loader try/catch
        try {
          const { validator, didValidatorProduceResult } =
            this.createValidator();

          const specLoaderValidatorResult =
            await new Promise<LoliClientSpecLoaderValidatorResult>(
              (resolve, reject) => {
                let timedOut = false;
                let timeout: ReturnType<typeof setTimeout> | undefined =
                  undefined;

                // Set up the timeout if enabled
                if (this.options.specLoaderTimeoutMilliseconds >= 0) {
                  timeout = setTimeout(() => {
                    timedOut = true;

                    // Reject will be handled by outer try/catch
                    reject(
                      new Error(
                        `Loader timed out after ${this.options.specLoaderTimeoutMilliseconds}ms.`,
                      ),
                    );
                  }, this.options.specLoaderTimeoutMilliseconds);
                }

                // Load actual spec with validator
                this.specLoader(validator)
                  .then((result) => {
                    if (!timedOut) {
                      clearTimeout(timeout);
                      resolve(result);
                    }
                  })
                  .catch((cause) => {
                    reject(cause);
                  });
              },
            );

          // Verify that the spec loader used the provided validator.
          if (!didValidatorProduceResult(specLoaderValidatorResult)) {
            throw new Error(
              "The spec loader did not use the provided validator or used it multiple times and did not return the last result.",
            );
          }

          // Report validation issues
          if (specLoaderValidatorResult.state === "invalid-spec-loaded") {
            this.callbacks.specValidationFailure(
              `Critical error: The fetched spec had schema or semantic issues. Cause: ${specLoaderValidatorResult.error}`,
              specLoaderValidatorResult.loadedData,
              specLoaderValidatorResult.error,
            );

            continue; // next load attempt
          }

          this.loliSpec = specLoaderValidatorResult.loadedAndValidatedSpec;
          this.loliSpecLoadedTimestamp = new Date();

          // Report success
          this.callbacks.specLoadedAndValidated?.(
            specLoaderValidatorResult.loadedAndValidatedSpec,
          );

          break loadAttempts; // Very important -> stop for-loop on success.
        } catch (error) {
          this.callbacks.specLoaderFailure(
            `Critical error: The spec loader failed. Error: ${error}`,
            error,
          );
        }
      } // End of for-loop for attempts.
    } catch (error) {
      this.callbacks.specLoaderFailure(
        `Critical error: The loading the spec failed due to an unknown error. Error: ${error}`,
        error,
      );
    } finally {
      if (!this.loliSpec) {
        this.loliSpecLoadFailureTimestamp = new Date();
      }
      this.currentLoadPromise = null;
      currentLoadPromiseResolve();
    }
  }

  /**
   * In case a loli spec has already been loaded, this function will
   * resolve immediately. If no valid loliSpec has been fetched yet
   * and a loading approach is in progress, this function will wait
   * for this loading approach to end.
   *
   * When this function resolves, it does not necessarily mean that
   * the loading succeeded.
   *
   * Please use the callbacks to be informed about loading failures and successes.
   */
  async waitForFirstSpecLoadToFinish(): Promise<void> {
    if (!this.loliSpec && this.currentLoadPromise) {
      await this.currentLoadPromise;
    }
  }

  /**
   * Triggers a (re)load of the specification using the spec loader
   * internally.
   *
   * Kicks off a call to {@link loadAndValidateLoliSpec} using
   * {@link setTimeout} with a timeout of zero milliseconds.
   *
   * @returns Returns a promise that resolves when the internal load attempt with the spec loader finishes/fails. The promise will never reject.
   */
  triggerSpecReload(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.loadAndValidateLoliSpec().then(resolve).catch(reject);
      }, 0);
    });
  }

  /**
   * Calls {@link triggerSpecReload} when some of the following conditions are true:
   *  - this.loliSpecLoadedTimestamp is null (no successful load attempt yet)
   *  - options.specCacheTimeToLiveMilliseconds is negative
   *  - the time elapsed between now and this.loliSpecLoadedTimestamp is greater than options.specCacheStaleTimeMilliseconds
   */
  private triggerReloadIfNotLoadedOrCacheExpired(): Promise<void> {
    if (
      !this.loliSpecLoadedTimestamp ||
      this.options.specCacheStaleTimeMilliseconds < 0 ||
      new Date().getTime() - this.loliSpecLoadedTimestamp.getTime() >
        this.options.specCacheStaleTimeMilliseconds
    ) {
      if (this.options.specReloadMaxBlockingWaitMilliseconds <= 0) {
        void this.triggerSpecReload();
      } else {
        let promiseResolve: () => void = () => undefined;
        let timedOut = false;

        const promise = new Promise<void>((resolve) => {
          promiseResolve = resolve;
        });

        const timeout = setTimeout(() => {
          timedOut = true;
          promiseResolve();
        }, this.options.specReloadMaxBlockingWaitMilliseconds);

        this.triggerSpecReload().then(() => {
          if (!timedOut) {
            clearTimeout(timeout);
            promiseResolve();
          }
        });

        return promise;
      }
    }

    return Promise.resolve();
  }

  /**
   * If no LoliSpec has been fetched yet, this method initiates
   * the loading process by calling {@link loadAndValidateLoliSpec}, waits
   * for it to be finished and then returns the fetched spec.
   *
   * This method calls {@link triggerReloadIfNotLoadedOrCacheExpired} in two cases:
   *  - the spec has already been successfully loaded and may needs to be reloaded due to a stale cache
   *  - or there already was a loading attempt that failed (in this case this method will return immediately
   *    to not block any evaluation after a first failed loading attempt)
   *
   * This method also waits for {@link triggerReloadIfNotLoadedOrCacheExpired}. This is useful, when
   * the option "specReloadMaxBlockingWaitMilliseconds" is >= 0ms. This way, e.g. an evaluation call
   * will use the newest spec version in case the cached spec was stale and the loader fast faster than
   * the specified "specReloadMaxBlockingWaitMilliseconds".
   *
   * @returns Loaded spec or null if loading failed.
   */
  private async getLoadedSpecOrLoad(): Promise<LoliSpec | null> {
    // If there was already a loading attempt that failed (indicated by truthy loliSpecLoadFailureTimestamp)
    // we do not want any evaluation to be blocked again. We don't want loading attempts to pile up
    // and rather continue in emergency fallback mode.
    if (!this.loliSpec && !this.loliSpecLoadFailureTimestamp) {
      await this.loadAndValidateLoliSpec();
    } else {
      await this.triggerReloadIfNotLoadedOrCacheExpired();
    }

    return this.loliSpec;
  }

  /**
   * Creates the evaluation metadata that is necessary for all
   * evaluation executions. Assigns "now" as the evaluationDateTime
   * and compute the rollout group using {@link computeRolloutGroup}
   * based on the given loliSpec and the given evaluationContext.
   *
   * @param loliSpec LoliSpec to be passed to {@link computeRolloutGroup}.
   * @param evaluationContext Evaluation context to be passed to {@link computeRolloutGroup}.
   * @returns Returns an evaluation metadata object that can be used for all evaluation executions.
   */
  private createEvaluationMetadata(
    loliSpec: LoliSpec,
    evaluationContext: EvaluationContext,
  ): EvaluationMetadata {
    return {
      evaluationDateTime: new Date(),
      rolloutGroup: computeRolloutGroup(loliSpec, evaluationContext),
      segmentEvaluationCache: new Map(),
      warningLogger: this.callbacks.evaluationWarning,
    };
  }

  private getFallbackByFeatureFlagNameAndOrDataType<
    FEATURE_FLAG extends FeatureFlag,
  >(
    featureFlagName: string,
    emergencyFallback: FeatureFlagOutput<FEATURE_FLAG>,
    expectedType: FEATURE_FLAG["type"],
  ) {
    const valueByFeatureFlagName =
      this.options.emergencyFallbacksByFeatureFlagName[featureFlagName];

    if (
      valueByFeatureFlagName &&
      typeof valueByFeatureFlagName === expectedType
    ) {
      return valueByFeatureFlagName;
    }

    return emergencyFallback;
  }

  /**
   * Evaluates a feature flag based on the given name, evaluationContext, and emergency fallback value.
   *
   * Does the following things:
   *  - obtains the loliSpec via {@link getLoadedSpecOrLoad} and waits for the result
   *    - if loliSpec is null: return {@link getFallbackByFeatureFlagNameAndOrDataType} and call callbacks.emergencyFallbackUsed
   *  - obtain feature flag from spec via {@link getFeatureFlagFromLoliSpecByName}
   *    - if feature flag was not found: return {@link getFallbackByFeatureFlagNameAndOrDataType} and call callbacks.emergencyFallbackUsed
   *  - compare feature flag's type against the given expectedType
   *    - on mismatch:
   *      - for data type mismatch behavior "emergency-fallback": return emergency fallback value by data type and call callbacks.emergencyFallbackUsed
   *      - for data type mismatch behavior "error": throws an error
   *  - creates evaluationMetadata using {@link createEvaluationMetadata}
   *  - evaluates feature flag using {@link evaluateFeatureFlag}
   *
   * If an unknown error occurs, the method will return the emergency fallback value and call callbacks.emergencyFallbackUsed.
   *
   * @param featureFlagName Name of feature flag to be evaluated.
   * @param evaluationContext Evaluation context to be used for the evaluation.
   * @param emergencyFallback Fallback value to be used in emergency cases (missing spec, unknown feature flag, unknown error).
   * @param expectedType Feature flag that is expected.
   * @returns Result of {@link evaluateFeatureFlag} or emergency fallback value.
   */
  private async evaluateSingleFeatureFlag<FEATURE_FLAG extends FeatureFlag>(
    featureFlagName: string,
    evaluationContext: EvaluationContext,
    emergencyFallback: FeatureFlagOutput<FEATURE_FLAG>,
    expectedType: FEATURE_FLAG["type"],
  ): Promise<FeatureFlagOutput<FEATURE_FLAG>> {
    try {
      const loliSpec = await this.getLoadedSpecOrLoad();

      if (!loliSpec) {
        this.callbacks.emergencyFallbackUsed(
          `Critical warning: Evaluation of feature flag "${featureFlagName}" failed due to missing LoliSpec. Returning emergency fallback value.`,
        );

        return this.getFallbackByFeatureFlagNameAndOrDataType(
          featureFlagName,
          emergencyFallback,
          expectedType,
        );
      }

      const featureFlag = getFeatureFlagFromLoliSpecByName(
        loliSpec,
        featureFlagName,
      );

      if (!featureFlag) {
        this.callbacks.emergencyFallbackUsed(
          `Critical warning: Evaluation failed. Feature flag "${featureFlagName}" flag does not exist. Returning emergency fallback value.`,
        );

        return this.getFallbackByFeatureFlagNameAndOrDataType(
          featureFlagName,
          emergencyFallback,
          expectedType,
        );
      }

      if (featureFlag.type !== expectedType) {
        switch (this.options.dataTypeMismatchBehavior) {
          case "emergency-fallback": {
            this.callbacks.emergencyFallbackUsed(
              `Critical warning: Evaluation failed. Feature flag "${featureFlagName}" has type "${featureFlag.type}", but type "${expectedType}" was expected. Returning emergency fallback value. (dataTypeMismatchBehavior = ${this.options.dataTypeMismatchBehavior})`,
            );

            return emergencyFallback;
          }
          case "error": {
            const error = new Error(
              `Critical error: Evaluation failed. Feature flag "${featureFlagName}" has type "${featureFlag.type}", but type "${expectedType}" was expected. Returning emergency fallback value. (dataTypeMismatchBehavior = ${this.options.dataTypeMismatchBehavior})`,
            );

            (error as unknown as Record<string, unknown>)._rethrow = true;

            throw error;
          }
        }
      }

      const evaluationMetadata = this.createEvaluationMetadata(
        loliSpec,
        evaluationContext,
      );

      return evaluateFeatureFlag(
        featureFlag,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );
    } catch (error) {
      if ((error as unknown as Record<string, unknown>)._rethrow === true) {
        throw error;
      }

      this.callbacks.emergencyFallbackUsed(
        `Critical error: Evaluation of feature flag "${featureFlagName}" failed due to an unknown error. Are you operating in _dangerous.assumeDataIsValidSpec mode? Returning emergency fallback. Error: ${error}`,
        error,
      );

      return this.getFallbackByFeatureFlagNameAndOrDataType(
        featureFlagName,
        emergencyFallback,
        expectedType,
      );
    }
  }

  /**
   * Evaluates a boolean feature flag denoted by the given featureFlagName.
   * The given evaluationContext is used throughout the whole evaluation process.
   *
   * In case there was a problem to load the LoliSpec or in case the no feature flag
   * was found in the spec by the given name, this method returns the emergency fallback value
   * by feature flag name if present (defined in the options attribute "emergencyFallbacksByFeatureFlagName")
   * or returns the emergency fallback value that has been defined for boolean feature flags (defined
   * in the options attribute "emergencyFallbacksByDataType").
   *
   * Edge case: If the feature flag was found in the spec but had a different type than "boolean",
   * this method will only return the emergency fallback value by data type (options attribute
   * "emergencyFallbacksByDataType") and never the fallback value by feature flag name.
   *
   * @param featureFlagName Name of the boolean feature flag to be evaluated.
   * @param evaluationContext Evaluation context data which is used throughout the whole evaluation process.
   * @returns Feature flags evaluated boolean value or emergency fallback value.
   */
  evaluateBooleanFeatureFlag(
    featureFlagName: string,
    evaluationContext: EvaluationContext,
  ): Promise<boolean> {
    return this.evaluateSingleFeatureFlag<BooleanFeatureFlag>(
      featureFlagName,
      evaluationContext,
      this.options.emergencyFallbacksByDataType.boolean,
      "boolean",
    );
  }

  /**
   * Evaluates a number feature flag denoted by the given featureFlagName.
   * The given evaluationContext is used throughout the whole evaluation process.
   *
   * In case there was a problem to load the LoliSpec or in case the no feature flag
   * was found in the spec by the given name, this method returns the emergency fallback value
   * by feature flag name if present (defined in the options attribute "emergencyFallbacksByFeatureFlagName")
   * or returns the emergency fallback value that has been defined for number feature flags (defined
   * in the options attribute "emergencyFallbacksByDataType").
   *
   * Special case: If the feature flag was found in the spec but had a different type than "number",
   * this method will only return the emergency fallback value by data type (options attribute
   * "emergencyFallbacksByDataType") and never the fallback value by feature flag name.
   *
   * @param featureFlagName Name of the number feature flag to be evaluated.
   * @param evaluationContext Evaluation context data which is used throughout the whole evaluation process.
   * @returns Feature flags evaluated number value or emergency fallback value.
   */
  evaluateNumberFeatureFlag(
    featureFlagName: string,
    evaluationContext: EvaluationContext,
  ): Promise<number> {
    return this.evaluateSingleFeatureFlag<NumberFeatureFlag>(
      featureFlagName,
      evaluationContext,
      this.options.emergencyFallbacksByDataType.number,
      "number",
    );
  }

  /**
   * Evaluates a string feature flag denoted by the given featureFlagName.
   * The given evaluationContext is used throughout the whole evaluation process.
   *
   * In case there was a problem to load the LoliSpec or in case the no feature flag
   * was found in the spec by the given name, this method returns the emergency fallback value
   * by feature flag name if present (defined in the options attribute "emergencyFallbacksByFeatureFlagName")
   * or returns the emergency fallback value that has been defined for string feature flags (defined
   * in the options attribute "emergencyFallbacksByDataType").
   *
   * Special case: If the feature flag was found in the spec but had a different type than "string",
   * this method will only return the emergency fallback value by data type (options attribute
   * "emergencyFallbacksByDataType") and never the fallback value by feature flag name.
   *
   * @param featureFlagName Name of the string feature flag to be evaluated.
   * @param evaluationContext Evaluation context data which is used throughout the whole evaluation process.
   * @returns Feature flags evaluated string value or emergency fallback value.
   */
  evaluateStringFeatureFlag(
    featureFlagName: string,
    evaluationContext: EvaluationContext,
  ): Promise<string> {
    return this.evaluateSingleFeatureFlag<StringFeatureFlag>(
      featureFlagName,
      evaluationContext,
      this.options.emergencyFallbacksByDataType.string,
      "string",
    );
  }

  /**
   * Evaluates all feature flags that are defined in the LoliSpec at once
   * and returns an object mapping feature flag names to their corresponding
   * evaluated values.
   *
   * In case there was a problem to load the LoliSpec this method returns
   * the emergency fallback object value that has been defined for the
   * all feature flag evaluation on client creation (can be changed via client
   * options attribute "emergencyFallbacksByFeatureFlagName").
   *
   * @param evaluationContext Evaluation context data which is used throughout the whole evaluation process.
   */
  async evaluateAllFeatureFlags(
    evaluationContext: EvaluationContext,
  ): Promise<LoliClientAllFeatureFlagsEvaluationResult> {
    try {
      const loliSpec = await this.getLoadedSpecOrLoad();

      if (!loliSpec) {
        this.callbacks.emergencyFallbackUsed(
          `Critical warning: Evaluation of all feature flags failed due to missing LoliSpec. Returning fallback emergency fallback for all feature flags.`,
        );

        return this.options.emergencyFallbacksByFeatureFlagName;
      }

      const evaluationMetadata = this.createEvaluationMetadata(
        loliSpec,
        evaluationContext,
      );

      const evaluatedFeatureFlags: LoliClientAllFeatureFlagsEvaluationResult =
        {};

      for (const featureFlag of loliSpec.featureFlags) {
        evaluatedFeatureFlags[featureFlag.name] = evaluateFeatureFlag(
          featureFlag,
          loliSpec,
          evaluationContext,
          evaluationMetadata,
        );
      }

      return evaluatedFeatureFlags;
    } catch (error) {
      this.callbacks.emergencyFallbackUsed(
        `Critical error: Evaluation of all feature flags failed due to unknown error. Are you operating in _dangerous.assumeDataIsValidSpec mode? Returning fallback emergency fallback for all feature flags. Error: ${error}`,
        error,
      );

      return this.options.emergencyFallbacksByFeatureFlagName;
    }
  }
}
