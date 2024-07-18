import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import invalidSchemaSpec from "../../test-utils/examplesSpecs/invalidSchemaSpec.json";
import semanticIssuesSpec from "../../test-utils/examplesSpecs/semanticIssuesSpec.json";
import validSpec from "../../test-utils/examplesSpecs/validSpec.json";
import { wait } from "../../test-utils/wait";
import { LoliSpecInvalidSchemaError } from "../errors/types/LoliSpecInvalidSchemaError";
import { LoliSpecMalformedJsonError } from "../errors/types/LoliSpecMalformedJsonError";
import { LoliSpecSemanticIssuesError } from "../errors/types/LoliSpecSemanticIssuesError";
import type { EvaluationContext } from "../evaluation/EvaluationContext";
import type { EvaluationWarningType } from "../evaluation/EvaluationWarningLogging";
import type { FeatureFlagType } from "../schema/featureFlags/FeatureFlag";
import { FeatureFlagTypes } from "../schema/featureFlags/FeatureFlag";
import type { LoliSpec } from "../schema/LoliSpec";
import { createDefaultLoliClientOptions, LoliClient } from "./client";
import type { LoliClientSpecLoader } from "./types";

const invalidSchemaSpecStringified = JSON.stringify(invalidSchemaSpec);

const semanticIssuesSpecStringified = JSON.stringify(semanticIssuesSpec);

const validSpecStringified = JSON.stringify(validSpec);

const invalidSchemaSpecLoader: LoliClientSpecLoader = (processor) =>
  Promise.resolve(processor(invalidSchemaSpecStringified));

const semanticIssuesSpecLoader: LoliClientSpecLoader = (processor) =>
  Promise.resolve(processor(semanticIssuesSpecStringified));

const validSpecLoader: LoliClientSpecLoader = (processor) =>
  Promise.resolve(processor(validSpecStringified));

describe("createDefaultLoliClientOptions", () => {
  test("returns object with specLoaderTimeoutMilliseconds = 15s", () => {
    expect(createDefaultLoliClientOptions().specLoaderTimeoutMilliseconds).toBe(
      15_000,
    );
  });

  test("returns object with specLoaderMaxRetries = 5", () => {
    expect(createDefaultLoliClientOptions().specLoaderMaxRetries).toBe(5);
  });

  test("returns object with specLoaderFailureRetryDelayMilliseconds = 2.5s", () => {
    expect(
      createDefaultLoliClientOptions().specLoaderFailureRetryDelayMilliseconds,
    ).toBe(2500);
  });

  test("returns object with specCacheStaleTimeMilliseconds = 15s", () => {
    expect(
      createDefaultLoliClientOptions().specCacheStaleTimeMilliseconds,
    ).toBe(15_000);
  });

  test("returns object with disableInitialSpecLoadOnCreation = false", () => {
    expect(
      createDefaultLoliClientOptions().disableInitialSpecLoadOnCreation,
    ).toBe(false);
  });

  test("returns object with emergencyFallbacksByFeatureFlagName = empty object", () => {
    expect(
      createDefaultLoliClientOptions().emergencyFallbacksByFeatureFlagName,
    ).toEqual({});
  });

  test("returns object with emergencyFallbacksByDataType = object with false/0/empty string", () => {
    expect(
      createDefaultLoliClientOptions().emergencyFallbacksByDataType,
    ).toEqual({ boolean: false, number: 0, string: "" });
  });

  test("returns object with dataTypeMismatchBehavior = emergency-fallback", () => {
    expect(createDefaultLoliClientOptions().dataTypeMismatchBehavior).toBe(
      "emergency-fallback",
    );
  });

  test("returns object with callback behavior = non-blocking", () => {
    expect(createDefaultLoliClientOptions().callbackBehavior).toBe(
      "non-blocking",
    );
  });
});

describe("LoliClient", () => {
  describe("constructor", () => {
    test("triggers the initial load with default settings and string loader", async () => {
      let loliSpec: LoliSpec | null = null;

      const client = new LoliClient(
        validSpecLoader,
        {},
        {
          specLoadedAndValidated: (loadedSpec) => {
            loliSpec = loadedSpec;
          },
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(loliSpec).toBeTruthy();
      expect(loliSpec).toEqual(validSpec);
    });

    test("triggers the initial load with object loader", async () => {
      let loliSpec: LoliSpec | null = null;

      const client = new LoliClient(
        (processor) => Promise.resolve(processor(validSpec)),
        {},
        {
          specLoadedAndValidated: (loadedSpec) => {
            loliSpec = loadedSpec;
          },
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(loliSpec).toBeTruthy();
      expect(loliSpec).toEqual(validSpec);
    });

    test("triggers no initial load with disabled settings", async () => {
      let loliSpec: LoliSpec | null = null;

      const client = new LoliClient(
        validSpecLoader,
        { disableInitialSpecLoadOnCreation: true },
        {
          specLoadedAndValidated: (loadedSpec) => {
            loliSpec = loadedSpec;
          },
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(loliSpec).toBeNull();
    });
  });

  // This implicitly tests createDefaultLoliClientCallbacks()
  describe("default callbacks", () => {
    const originalConsoleWarn: (typeof console)["warn"] = console.warn;
    const originalConsoleError: (typeof console)["error"] = console.error;

    let consoleWarnMock = jest.fn<(typeof console)["warn"]>();
    let consoleErrorMock = jest.fn<(typeof console)["error"]>();

    beforeEach(() => {
      consoleWarnMock = jest.fn<(typeof console)["warn"]>();
      consoleErrorMock = jest.fn<(typeof console)["error"]>();
      console.warn = consoleWarnMock;
      console.error = consoleErrorMock;
    });

    afterEach(() => {
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    });

    test("Default specLoaderFailure callback logs to console.error", async () => {
      const client = new LoliClient(
        () => Promise.reject(new Error("error 42")),
        { specLoaderMaxRetries: 0 },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain("error 42");
    });

    test("Default specValidationFailure callback logs to console.error", async () => {
      const client = new LoliClient(invalidSchemaSpecLoader, {
        specLoaderMaxRetries: 0,
      });

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain(
        "schema or semantic issues",
      );
    });

    test("Default emergencyFallbackUsed callback logs to console.error", async () => {
      const client = new LoliClient(validSpecLoader, {
        specLoaderMaxRetries: 0,
      });

      await client.waitForFirstSpecLoadToFinish();

      await client.evaluateBooleanFeatureFlag("non-existing-feature-flag", {});
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain("emergency fallback");
    });

    test("Default evaluationWarning callback logs to console.warn", async () => {
      const client = new LoliClient(validSpecLoader, {
        specLoaderMaxRetries: 0,
      });

      await client.waitForFirstSpecLoadToFinish();

      await client.evaluateBooleanFeatureFlag("ai-pilot", {
        // email: "test@acme.com", // this will cause a property-value-not-found warning
        settingsFlags: ["betaTesters"],
        // subscriptionPlanId: "enterprise-yearly", // this too
      });
      await wait(1);

      expect(consoleWarnMock).toHaveBeenCalledTimes(2);
      expect(consoleWarnMock.mock.calls[0][0]).toContain(
        "property-value-not-found",
      );
      expect(consoleWarnMock.mock.calls[1][0]).toContain(
        "property-value-not-found",
      );
    });

    test("Default specLoaderProcessorCallbackFailure callback logs to console.error", async () => {
      const client = new LoliClient(
        (processor) => {
          return processor(validSpec, {
            receivedValidSpec: () => {
              throw new Error("ABC123");
            },
          });
        },
        {
          specLoaderMaxRetries: 0,
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain("receivedValidSpec");
      expect(consoleErrorMock.mock.calls[0][0]).toContain("ABC123");
    });
  });

  describe("callbacks", () => {
    describe("specLoaderFailure", () => {
      test("gets called when the loader timed out", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          () => new Promise((resolve) => setTimeout(resolve, 1700)),
          {
            specLoaderTimeoutMilliseconds: 1500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain("timed out");
      });

      test("gets called when the loader throws an error", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          () =>
            new Promise(() => {
              throw new Error("blablabla");
            }),
          {
            specLoaderTimeoutMilliseconds: 1500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain("blablabla");
      });

      test("gets called when the loader returns a null result", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor(null as unknown as string)),
          {
            specLoaderTimeoutMilliseconds: 1500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "was neither a string nor an object",
        );
      });

      test("gets called when the loader does not use the processor", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          () =>
            Promise.resolve({
              state: "valid-spec-loaded",
              loadedAndValidatedSpec: validSpec as LoliSpec,
            }),
          {
            specLoaderTimeoutMilliseconds: 1500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "spec loader did not use the provided processor",
        );
      });

      test("gets called when the loader uses the processor, but does not return its loli spec result", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          async (processor) => {
            const processorResult = await processor(validSpec);

            return {
              ...processorResult,
              loadedAndValidatedSpec: validSpec as LoliSpec,
            };
          },
          {
            specLoaderTimeoutMilliseconds: 1500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "spec loader did not use the provided processor",
        );
      });
    });

    describe("specLoaderProcessorCallbackFailure", () => {
      test("gets called when the receivedInvalidData callback fails", async () => {
        let callbackCalled = false;
        let callbackMessage: null | string = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          (processor) => {
            return processor(invalidSchemaSpec, {
              receivedInvalidData: () => {
                throw new Error("TEST-1-2-3");
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderProcessorCallbackFailure: (message, cause) => {
              callbackCalled = true;
              callbackMessage = message;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCalled).toBe(true);
        expect(callbackMessage).toContain("receivedInvalidData");
        expect(callbackMessage).toContain("TEST-1-2-3");
        expect(callbackCause instanceof Error).toBe(true);
        expect(`${callbackCause}`).toContain("TEST-1-2-3");
      });

      test("gets called when the receivedValidSpec callback fails", async () => {
        let callbackCalled = false;
        let callbackMessage: null | string = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          (processor) => {
            return processor(validSpec, {
              receivedValidSpec: () => {
                throw new Error("TEST-4-5-6");
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderProcessorCallbackFailure: (message, cause) => {
              callbackCalled = true;
              callbackMessage = message;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCalled).toBe(true);
        expect(callbackMessage).toContain("receivedValidSpec");
        expect(callbackMessage).toContain("TEST-4-5-6");
        expect(callbackCause instanceof Error).toBe(true);
        expect(`${callbackCause}`).toContain("TEST-4-5-6");
      });
    });

    describe("specValidationFailure", () => {
      test("gets called when the loaded spec is invalid JSON", async () => {
        let callbackMessage: string | null = null;
        let callbackLoaded: unknown = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor("{abc}")),
          {
            specLoaderMaxRetries: 0,
          },
          {
            specValidationFailure: (message, specLoaderResult, cause) => {
              callbackMessage = message;
              callbackLoaded = specLoaderResult;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackMessage).toBeTruthy();
        expect(callbackMessage).toContain("schema or semantic issues");
        expect(callbackLoaded).toBe("{abc}");
        expect(Object.isFrozen(callbackLoaded)).toBe(true);
        expect(callbackCause instanceof LoliSpecMalformedJsonError).toBe(true);
      });

      test("gets called when the loaded spec has schema issues", async () => {
        let callbackMessage: string | null = null;
        let callbackLoaded: unknown = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          invalidSchemaSpecLoader,
          {
            specLoaderMaxRetries: 0,
          },
          {
            specValidationFailure: (message, specLoaderResult, cause) => {
              callbackMessage = message;
              callbackLoaded = specLoaderResult;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackMessage).toBeTruthy();
        expect(callbackMessage).toContain("schema or semantic issues");
        expect(callbackLoaded).toBe(invalidSchemaSpecStringified);
        expect(callbackCause instanceof LoliSpecInvalidSchemaError).toBe(true);
      });

      test("gets called when the loaded spec has semantic issues", async () => {
        let callbackMessage: string | null = null;
        let callbackLoaded: unknown = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          semanticIssuesSpecLoader,
          {
            specLoaderMaxRetries: 0,
          },
          {
            specValidationFailure: (message, specLoaderResult, cause) => {
              callbackMessage = message;
              callbackLoaded = specLoaderResult;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackMessage).toBeTruthy();
        expect(callbackMessage).toContain("schema or semantic issues");
        expect(callbackLoaded).toBe(semanticIssuesSpecStringified);
        expect(callbackCause instanceof LoliSpecSemanticIssuesError).toBe(true);
      });
    });

    describe("specLoadedAndValidated", () => {
      test("gets called when constructor triggers initial load", async () => {
        let callbackSpec: LoliSpec | null = null;

        const client = new LoliClient(
          validSpecLoader,
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);
      });

      test("gets called when spec is first loaded via feature flag evaluation", async () => {
        let callbackSpec: LoliSpec | null = null;

        const client = new LoliClient(
          validSpecLoader,
          {
            disableInitialSpecLoadOnCreation: true,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackSpec = loadedSpec;
            },
          },
        );

        await wait(10);

        expect(callbackSpec).toBeNull();

        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(1);

        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);
      });

      test("gets called when spec reload is triggered", async () => {
        let callbackSpec: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);

        callbackSpec = null;

        client.triggerSpecReload();
        await wait(10);

        expect(callbackCount).toBe(2);
        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);
      });

      test("gets not called when spec is in cache and cache is still valid", async () => {
        let callbackSpec: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {
            specCacheStaleTimeMilliseconds: 250,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);

        // This evaluation call should not trigger a refetch
        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(1);

        expect(callbackCount).toBe(1);
      });

      test("gets called when spec is in cache but cache expired", async () => {
        let callbackSpec: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {
            specCacheStaleTimeMilliseconds: 250,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);

        // This wait should retrigger the spec reloading as then the cache is stale
        callbackSpec = null;
        await wait(300);
        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(10);

        expect(callbackCount).toBe(2);
        expect(JSON.stringify(callbackSpec)).toBe(validSpecStringified);
      });

      test("receives a new and frozen spec object", async () => {
        let callbackSpec: LoliSpec | null = null;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor(validSpec)),
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackSpec).toBeTruthy();
        expect(Object.isFrozen(callbackSpec)).toBe(true);
        expect(callbackSpec).not.toBe(validSpec);
      });
    });
  });

  describe("options", () => {
    describe("callback behavior", () => {
      test("non-blocking mode: callbacks are called later for", async () => {
        let callbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {},
          {
            specLoadedAndValidated: () => {
              callbackCalled = true;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();

        expect(callbackCalled).toBe(false);

        await wait(1);

        expect(callbackCalled).toBe(true);
      });

      test("blocking mode: callbacks are called immediately", async () => {
        let callbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            callbackBehavior: "blocking",
          },
          {
            specLoadedAndValidated: () => {
              callbackCalled = true;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        expect(callbackCalled).toBe(true);
      });
    });

    describe("retries", () => {
      test("Loader is only called once if retries is zero", async () => {
        let loaderCounter = 0;
        let loliSpec: LoliSpec | null = null;

        const client = new LoliClient(
          async () => {
            loaderCounter++;
            await wait(50);
            throw new Error("error 22");
          },
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderCounter).toBe(1);
        expect(loliSpec).toBeNull();
      });

      test("Loader is called 6 times if retries = 5 and result of last retry is returned", async () => {
        let loaderCounter = 0;
        let loliSpec: LoliSpec | null = null;

        const client = new LoliClient(
          async (processor) => {
            loaderCounter++;
            await wait(50);

            if (loaderCounter === 6) {
              return processor(validSpec);
            }

            throw new Error("error 22");
          },
          {
            specLoaderMaxRetries: 5,
            specLoaderFailureRetryDelayMilliseconds: 0,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderCounter).toBe(6);
        expect(loliSpec).toEqual(validSpec);
      });
    });

    describe("retry delay", () => {
      test("Retries happen immediately if delay = 0", async () => {
        let loaderCounter = 0;
        let timestampBefore = Date.now();
        const loaderCallDelays: number[] = [];
        let loliSpec: LoliSpec | null = null;

        const client = new LoliClient(
          async () => {
            loaderCounter++;
            const now = Date.now();
            loaderCallDelays.push(now - timestampBefore);
            timestampBefore = now;

            throw new Error("error 22");
          },
          {
            specLoaderMaxRetries: 2,
            specLoaderFailureRetryDelayMilliseconds: 0,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderCounter).toBe(3);
        expect(loliSpec).toBeNull();

        expect(loaderCallDelays[0]).toBeLessThanOrEqual(50);
        expect(loaderCallDelays[1]).toBeLessThanOrEqual(50);
        expect(loaderCallDelays[2]).toBeLessThanOrEqual(50);
      });

      test("Retries happen with the correct delay (if set to 500ms)", async () => {
        let loaderCounter = 0;
        let timestampBefore = Date.now();
        const loaderCallDelays: number[] = [];
        let loliSpec: LoliSpec | null = null;

        const client = new LoliClient(
          async () => {
            loaderCounter++;
            const now = Date.now();
            loaderCallDelays.push(now - timestampBefore);
            timestampBefore = now;

            throw new Error("error 22");
          },
          {
            specLoaderMaxRetries: 2,
            specLoaderFailureRetryDelayMilliseconds: 500,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderCounter).toBe(3);
        expect(loliSpec).toBeNull();

        expect(loaderCallDelays[0]).toBeLessThanOrEqual(50); // initial load -> no delay

        // Subsequent retries -> delays
        expect(loaderCallDelays[1]).toBeGreaterThanOrEqual(500);
        expect(loaderCallDelays[2]).toBeGreaterThanOrEqual(500);
      });
    });

    describe("loader timeout", () => {
      test("load succeeds if loader is faster than timeout", async () => {
        let loliSpec: LoliSpec | null = null;
        let failureCallbackCalled = false;

        const client = new LoliClient(
          async (processor) => {
            await wait(100);
            return processor(validSpec);
          },
          {
            specLoaderTimeoutMilliseconds: 500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
            specLoaderFailure: () => {
              failureCallbackCalled = true;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loliSpec).toEqual(validSpec);
        expect(failureCallbackCalled).toBe(false);
      });

      test("load fails if loader is slower than timeout", async () => {
        let loliSpec: LoliSpec | null = null;
        let failureCallbackCalled = false;

        const client = new LoliClient(
          async (processor) => {
            await wait(600);
            return processor(validSpec);
          },
          {
            specLoaderTimeoutMilliseconds: 500,
            specLoaderMaxRetries: 0,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              loliSpec = loadedSpec;
            },
            specLoaderFailure: () => {
              failureCallbackCalled = true;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loliSpec).toBeNull();
        expect(failureCallbackCalled).toBe(true);
      });
    });

    describe("cache stale time", () => {
      test("Reload is only executed when triggered after the cache stale time", async () => {
        let loaderCounter = 0;

        const client = new LoliClient(
          async (processor) => {
            loaderCounter++;
            return processor(validSpec);
          },
          {
            specCacheStaleTimeMilliseconds: 500,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);
        expect(loaderCounter).toBe(1);

        await client.evaluateBooleanFeatureFlag("ai-pilot", {
          email: "test@acme.com",
          settingsFlags: ["betaTesters"],
          subscriptionPlanId: "enterprise-yearly",
        });

        // The evaluate call above must have not triggered a loader execution
        await wait(50);
        expect(loaderCounter).toBe(1);

        // Now we wait longer than the cache stale time
        await wait(500);

        await client.evaluateBooleanFeatureFlag("ai-pilot", {
          email: "test@acme.com",
          settingsFlags: ["betaTesters"],
          subscriptionPlanId: "enterprise-yearly",
        });
        await wait(50);

        // The evaluate call above must have now triggered a reload due to an exceeded cache stale time
        expect(loaderCounter).toBe(2);
      });
    });
  });

  describe("processor callbacks", () => {
    describe("receivedInvalidData", () => {
      test("gets called when processor receives malformed JSON", async () => {
        let onInvalidCalled = false;
        let onInvalidLoadedData: unknown = null;
        let onInvalidError: unknown = null;

        const client = new LoliClient(
          async (processor) => {
            return processor(`{ "abc: 123123 }`, {
              receivedInvalidData: (loadedData, error) => {
                onInvalidCalled = true;
                onInvalidLoadedData = loadedData;
                onInvalidError = error;
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(onInvalidCalled).toBe(true);
        expect(onInvalidLoadedData).toBe(`{ "abc: 123123 }`);
        expect(onInvalidError instanceof LoliSpecMalformedJsonError).toBe(true);
      });

      test("gets called when processor receives an object with invalid Loli spec schema", async () => {
        let onInvalidCalled = false;
        let onInvalidLoadedData: unknown = null;
        let onInvalidError: unknown = null;

        const client = new LoliClient(
          async (processor) => {
            return processor(invalidSchemaSpec, {
              receivedInvalidData: (loadedData, error) => {
                onInvalidCalled = true;
                onInvalidLoadedData = loadedData;
                onInvalidError = error;
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(onInvalidCalled).toBe(true);
        expect(onInvalidLoadedData).toBe(invalidSchemaSpec);
        expect(onInvalidError instanceof LoliSpecInvalidSchemaError).toBe(true);
      });

      test("gets called when processor receives spec with semantic issues", async () => {
        let onInvalidCalled = false;
        let onInvalidLoadedData: unknown = null;
        let onInvalidError: unknown = null;

        const client = new LoliClient(
          async (processor) => {
            return processor(semanticIssuesSpec, {
              receivedInvalidData: (loadedData, error) => {
                onInvalidCalled = true;
                onInvalidLoadedData = loadedData;
                onInvalidError = error;
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(onInvalidCalled).toBe(true);
        expect(onInvalidLoadedData).toBe(semanticIssuesSpec);
        expect(onInvalidError instanceof LoliSpecSemanticIssuesError).toBe(
          true,
        );
      });

      test("processor waits for async callback to finish", async () => {
        let onInvalidCalled = false;

        const client = new LoliClient(
          async (processor) => {
            return processor(semanticIssuesSpec, {
              receivedInvalidData: async () => {
                onInvalidCalled = true;
                await wait(700);
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(onInvalidCalled).toBe(true);
      });
    });

    describe("receivedValidSpec", () => {
      test("gets called with validated and frozen spec when processor receives valid JSON spec", async () => {
        let callbackCalled = false;
        let callbackSpec: null | LoliSpec = null;

        const client = new LoliClient(
          async (processor) => {
            return processor(validSpec, {
              receivedValidSpec: (loliSpec) => {
                callbackCalled = true;
                callbackSpec = loliSpec;
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCalled).toBe(true);
        expect(Object.isFrozen(callbackSpec)).toBe(true);
        expect(callbackSpec).not.toBe(validSpec); // has to be a different object
        expect(JSON.stringify(callbackSpec)).toBe(JSON.stringify(validSpec));
      });

      test("processor waits for callback to finish", async () => {
        let callbackCalled = false;

        const client = new LoliClient(
          async (processor) => {
            return processor(validSpec, {
              receivedValidSpec: async () => {
                callbackCalled = true;
                await wait(700);
              },
            });
          },
          {
            specLoaderMaxRetries: 0,
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(callbackCalled).toBe(true);
      });
    });
  });

  describe("advanced loading behavior checks", () => {
    test("loader is never running multiple times in parallel", async () => {
      let loadedCounter = 0;

      const client = new LoliClient(
        (processor) =>
          new Promise((resolve) => {
            loadedCounter++;
            setTimeout(() => {
              resolve(processor(validSpec));
            }, 250);
          }),
        {
          disableInitialSpecLoadOnCreation: true,
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);
      expect(loadedCounter).toBe(0);

      // Kick off in total 3 evaluation calls during the first load (which is triggered by the first evaluation call).
      await Promise.all([
        client.evaluateBooleanFeatureFlag("ai-pilot", {
          email: "test@acme.com",
          settingsFlags: ["betaTesters"],
          subscriptionPlanId: "enterprise-yearly",
        }),
        async () => {
          await wait(50);
          await client.evaluateBooleanFeatureFlag("ai-pilot", {
            email: "test@acme.com",
            settingsFlags: ["betaTesters"],
            subscriptionPlanId: "enterprise-yearly",
          });
        },
        async () => {
          await wait(100);
          await client.evaluateBooleanFeatureFlag("ai-pilot", {
            email: "test@acme.com",
            settingsFlags: ["betaTesters"],
            subscriptionPlanId: "enterprise-yearly",
          });
        },
      ]);

      await wait(1);
      // Although multiple evaluations were kicked of, the loader must have been called only one time.
      expect(loadedCounter).toBe(1);
    });

    test("evaluation calls are not blocked by new loading attempts after there has been an initial failed attempt if specReloadBlockingWaitMilliseconds = zero", async () => {
      let loaderFailureCounter = 0;

      const client = new LoliClient(
        () =>
          new Promise((_, reject) =>
            setTimeout(reject, 500, new Error("error 55")),
          ),
        { specLoaderMaxRetries: 0, specReloadMaxBlockingWaitMilliseconds: 0 },
        {
          specLoaderFailure: () => {
            loaderFailureCounter++;
          },
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);
      expect(loaderFailureCounter).toBe(1);

      const start = Date.now();
      await client.evaluateBooleanFeatureFlag("ai-pilot", {});
      const end = Date.now();

      // Less than failure loader timeout -> not blocked by loader
      expect(end - start).toBeLessThanOrEqual(450);
      await wait(1);
      expect(loaderFailureCounter).toBe(1);

      // But evaluation call triggered reload -> after some time the failure callback is executed again.
      await wait(520);
      expect(loaderFailureCounter).toBe(2);
    });

    test("evaluation call caused reloads wait for a max time based on specReloadBlockingWaitMilliseconds", async () => {
      let loaderFailureCounter = 0;
      let loaderWait = 500;

      const client = new LoliClient(
        () =>
          new Promise((_, reject) =>
            setTimeout(reject, loaderWait, new Error("error 55")),
          ),
        { specLoaderMaxRetries: 0, specReloadMaxBlockingWaitMilliseconds: 800 },
        {
          specLoaderFailure: () => {
            loaderFailureCounter++;
          },
        },
      );

      await client.waitForFirstSpecLoadToFinish();
      await wait(1);
      expect(loaderFailureCounter).toBe(1);

      // Waits for loader to finish if faster than specReloadBlockingWaitMilliseconds
      const start = Date.now();
      await client.evaluateBooleanFeatureFlag("ai-pilot", {});
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(500);
      await wait(1);
      expect(loaderFailureCounter).toBe(2);

      // Wait max. for specReloadBlockingWaitMilliseconds and returns early
      loaderWait = 1200;

      const start2 = Date.now();
      await client.evaluateBooleanFeatureFlag("ai-pilot", {});
      const end2 = Date.now();

      expect(end2 - start2).toBeLessThanOrEqual(1150);
      await wait(1);
      expect(loaderFailureCounter).toBe(2); // stayed at 2 from previous wait

      // Loader still finishes and callback gets called
      await wait(loaderWait - (end2 - start2) + 200);
      expect(loaderFailureCounter).toBe(3);
    }, 10000);
  });

  const testCases: {
    [key in FeatureFlagType]: {
      evaluate: (
        client: LoliClient,
        featureFlagName: string,
        evaluationContext: EvaluationContext,
      ) => Promise<boolean | number | string>;
      featureFlagName: string;
      nameOfFeatureFlagWithDifferentDataType: string;
      expectedEmergencyFallback: boolean | number | string;
      expectedDefaultValue: boolean | number | string;
      successCase: {
        expectedOutput: boolean | number | string;
        evaluationContext: EvaluationContext;
      };
      invalidDataTypesCase: {
        evaluationContext: EvaluationContext;
      };
      emergencyFallbackByFeatureFlagName: boolean | number | string;
      emergencyFallbackByFeatureFlagNameWrongDataType:
        | boolean
        | number
        | string;
    };
  } = {
    boolean: {
      evaluate: (client, featureFlagName, evaluationContext) => {
        return client.evaluateBooleanFeatureFlag(
          featureFlagName,
          evaluationContext,
        );
      },
      featureFlagName: "ai-pilot",
      nameOfFeatureFlagWithDifferentDataType: "number-of-workspaces",
      expectedEmergencyFallback: false,
      expectedDefaultValue: false,
      successCase: {
        expectedOutput: true,
        evaluationContext: {
          email: "test@acme.com",
          settingsFlags: ["betaTesters"],
          subscriptionPlanId: "enterprise-yearly",
        },
      },
      invalidDataTypesCase: {
        evaluationContext: {
          email: 42,
          settingsFlags: "betaTesters",
          subscriptionPlanId: true,
        },
      },
      emergencyFallbackByFeatureFlagName: true,
      emergencyFallbackByFeatureFlagNameWrongDataType: "true",
    },
    number: {
      evaluate: (client, featureFlagName, evaluationContext) => {
        return client.evaluateNumberFeatureFlag(
          featureFlagName,
          evaluationContext,
        );
      },
      featureFlagName: "number-of-workspaces",
      nameOfFeatureFlagWithDifferentDataType: "top-banner",
      expectedEmergencyFallback: 0,
      expectedDefaultValue: 0,
      successCase: {
        expectedOutput: 20,
        evaluationContext: {
          email: "test@some-company.com",
          settingsFlags: [],
          subscriptionPlanId: "enterprise-yearly",
        },
      },
      invalidDataTypesCase: {
        evaluationContext: {
          email: 42,
          settingsFlags: "betaTesters",
          subscriptionPlanId: true,
        },
      },
      emergencyFallbackByFeatureFlagName: 31,
      emergencyFallbackByFeatureFlagNameWrongDataType: true,
    },
    string: {
      evaluate: (client, featureFlagName, evaluationContext) => {
        return client.evaluateStringFeatureFlag(
          featureFlagName,
          evaluationContext,
        );
      },
      featureFlagName: "top-banner",
      nameOfFeatureFlagWithDifferentDataType: "ai-pilot",
      expectedEmergencyFallback: "",
      expectedDefaultValue: "latest-product",
      successCase: {
        expectedOutput: "most-liked-product",
        evaluationContext: {
          email: "test@acme.com",
          settingsFlags: ["betaTester"],
          subscriptionPlanId: "starter-yearly",
        },
      },
      invalidDataTypesCase: {
        evaluationContext: {
          email: 42,
          settingsFlags: "betaTesters",
          subscriptionPlanId: true,
        },
      },
      emergencyFallbackByFeatureFlagName: "loli",
      emergencyFallbackByFeatureFlagNameWrongDataType: 4242,
    },
  };

  for (const featureFlagType of FeatureFlagTypes) {
    const testCase = testCases[featureFlagType];
    const {
      evaluate,
      featureFlagName,
      successCase,
      expectedEmergencyFallback,
      expectedDefaultValue,
      nameOfFeatureFlagWithDifferentDataType,
      invalidDataTypesCase,
      emergencyFallbackByFeatureFlagName,
      emergencyFallbackByFeatureFlagNameWrongDataType,
    } = testCase;

    describe(`evaluate${featureFlagType.charAt(0).toUpperCase() + featureFlagType.slice(1)}FeatureFlag`, () => {
      test(`returns ${JSON.stringify(successCase.expectedOutput)} for success evaluation`, async () => {
        const client = new LoliClient(validSpecLoader);

        const result = await evaluate(
          client,
          featureFlagName,
          successCase.evaluationContext,
        );

        expect(result).toBe(successCase.expectedOutput);
      });

      // Emergency fallback case for --> Load failure
      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} and calls emergencyFallbackUsed callback when spec could not be loaded`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor("")),
          { specLoaderMaxRetries: 0 },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          featureFlagName,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test(`returns emergency fallback ${JSON.stringify(emergencyFallbackByFeatureFlagName)} by feature flag name and calls emergencyFallbackUsed callback when spec could not be loaded`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor("")),
          {
            specLoaderMaxRetries: 0,
            emergencyFallbacksByFeatureFlagName: {
              [featureFlagName]: emergencyFallbackByFeatureFlagName,
            },
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          featureFlagName,
          successCase.evaluationContext,
        );

        expect(result).toBe(emergencyFallbackByFeatureFlagName);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} although emergency by feature flag is set (but wrong data type) and calls emergencyFallbackUsed callback when spec could not be loaded`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          (processor) => Promise.resolve(processor("")),
          {
            specLoaderMaxRetries: 0,
            emergencyFallbacksByFeatureFlagName: {
              [featureFlagName]:
                emergencyFallbackByFeatureFlagNameWrongDataType,
            },
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          featureFlagName,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      // Emergency fallback case --> flag does not exist
      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} and calls emergencyFallbackUsed callback when feature flag does not exist`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          { specLoaderMaxRetries: 0 },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          `non-existing-feature-flag-128631628312-asdasdasd-123123`,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test(`returns emergency fallback ${JSON.stringify(emergencyFallbackByFeatureFlagName)} by feature flag name and calls emergencyFallbackUsed callback when feature flag does not exist`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            specLoaderMaxRetries: 0,
            emergencyFallbacksByFeatureFlagName: {
              ["non-existing-feature-flag-128631628312-asdasdasd-123123"]:
                emergencyFallbackByFeatureFlagName,
            },
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          `non-existing-feature-flag-128631628312-asdasdasd-123123`,
          successCase.evaluationContext,
        );

        expect(result).toBe(emergencyFallbackByFeatureFlagName);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} although fallback by feature flag name is set (wrong data type) and calls emergencyFallbackUsed callback when feature flag does not exist`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            specLoaderMaxRetries: 0,
            emergencyFallbacksByFeatureFlagName: {
              ["non-existing-feature-flag-128631628312-asdasdasd-123123"]:
                emergencyFallbackByFeatureFlagNameWrongDataType,
            },
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          `non-existing-feature-flag-128631628312-asdasdasd-123123`,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      // Emergency cases: feature flag has different type
      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} and calls emergencyFallbackUsed callback when feature flag specification has different data type and behavior is 'emergency-fallback'`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            specLoaderMaxRetries: 0,
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          nameOfFeatureFlagWithDifferentDataType,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} although the fallback value by feature flag name has the correct data type and calls emergencyFallbackUsed callback when feature flag specification has different data type and behavior is 'emergency-fallback'`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            specLoaderMaxRetries: 0,
            emergencyFallbacksByFeatureFlagName: {
              [nameOfFeatureFlagWithDifferentDataType]:
                successCase.expectedOutput,
            },
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          nameOfFeatureFlagWithDifferentDataType,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      test("throws an error when feature flag has different data type and behavior is 'error'", async () => {
        const client = new LoliClient(validSpecLoader, {
          specLoaderMaxRetries: 0,
          dataTypeMismatchBehavior: "error",
        });

        await expect(async () => {
          await evaluate(
            client,
            nameOfFeatureFlagWithDifferentDataType,
            successCase.evaluationContext,
          );
        }).rejects.toThrow();
      });

      test(`returns emergency fallback ${JSON.stringify(expectedEmergencyFallback)} although fallback by feature flag name is set (wrong data type) and calls emergencyFallbackUsed callback when feature flag specification has different data type and behavior is 'emergency-fallback'`, async () => {
        let emergencyFallbackCallbackCalled = false;

        const client = new LoliClient(
          validSpecLoader,
          {
            specLoaderMaxRetries: 0,
          },
          {
            emergencyFallbackUsed: () => {
              emergencyFallbackCallbackCalled = true;
            },
          },
        );

        const result = await evaluate(
          client,
          nameOfFeatureFlagWithDifferentDataType,
          successCase.evaluationContext,
        );

        expect(result).toBe(expectedEmergencyFallback);

        await wait(10);

        expect(emergencyFallbackCallbackCalled).toBe(true);
      });

      // Default value cases
      test(`returns feature flag's default value ${JSON.stringify(expectedDefaultValue)} and calls evaluationWarning callback when evaluation context is empty`, async () => {
        const evaluationWarningTypes: EvaluationWarningType[] = [];

        const client = new LoliClient(
          validSpecLoader,
          { specLoaderMaxRetries: 0 },
          {
            evaluationWarning: (type) => {
              evaluationWarningTypes.push(type);
            },
          },
        );

        const result = await evaluate(client, featureFlagName, {});

        expect(result).toBe(expectedDefaultValue);

        await wait(10);

        expect(evaluationWarningTypes).toContain("property-value-not-found");
        expect(evaluationWarningTypes).not.toContain(
          "property-value-incorrect-data-type",
        );
      });

      test(`returns feature flag's default value ${JSON.stringify(expectedDefaultValue)} and calls evaluationWarning callback when evaluation context has values with incorrect data types`, async () => {
        const evaluationWarningTypes: EvaluationWarningType[] = [];

        const client = new LoliClient(
          validSpecLoader,
          { specLoaderMaxRetries: 0 },
          {
            evaluationWarning: (type) => {
              evaluationWarningTypes.push(type);
            },
          },
        );

        const result = await evaluate(
          client,
          featureFlagName,
          invalidDataTypesCase.evaluationContext,
        );

        expect(result).toBe(expectedDefaultValue);

        await wait(10);

        expect(evaluationWarningTypes).toContain(
          "property-value-incorrect-data-type",
        );
        expect(evaluationWarningTypes).not.toContain(
          "property-value-not-found",
        );
      });
    });
  }

  describe("evaluateAllFeatureFlags", () => {
    test("returns all evaluated feature flags", async () => {
      const client = new LoliClient(validSpecLoader);

      const evaluationContext: EvaluationContext = {
        email: "test@acme.com",
        settingsFlags: [],
        subscriptionPlanId: "enterprise-yearly",
      };

      const result = await client.evaluateAllFeatureFlags(evaluationContext);

      expect(result).toEqual({
        "ai-pilot": true,
        "dark-mode": false,
        "number-of-workspaces": 100,
        "top-banner": "pitch-limited-editions",
      });
    });

    test("returns emergency fallback and calls emergencyFallbackUsed callback when spec could not be loaded", async () => {
      let emergencyFallbackCallbackCalled = false;

      const client = new LoliClient(
        (processor) => Promise.resolve(processor("")),
        {
          specLoaderMaxRetries: 0,
          emergencyFallbacksByFeatureFlagName: {
            foo: "bar",
          },
        },
        {
          emergencyFallbackUsed: () => {
            emergencyFallbackCallbackCalled = true;
          },
        },
      );

      const evaluationContext: EvaluationContext = {
        email: "test@acme.com",
        settingsFlags: [],
        subscriptionPlanId: "enterprise-yearly",
      };

      const result = await client.evaluateAllFeatureFlags(evaluationContext);

      expect(result).toEqual({ foo: "bar" });

      await wait(1);

      expect(emergencyFallbackCallbackCalled).toBe(true);
    });

    test("returns feature flags' fallback values and calls evaluationWarning callback when evaluation context is empty", async () => {
      const warningTypes: EvaluationWarningType[] = [];

      const client = new LoliClient(
        validSpecLoader,
        {},
        {
          evaluationWarning: (type) => {
            warningTypes.push(type);
          },
        },
      );

      const evaluationContext: EvaluationContext = {};

      const result = await client.evaluateAllFeatureFlags(evaluationContext);

      expect(result).toEqual({
        "ai-pilot": false,
        "dark-mode": false,
        "number-of-workspaces": 0,
        "top-banner": "latest-product",
      });

      await wait(1);

      expect(warningTypes).toContain("property-value-not-found");
      expect(warningTypes).not.toContain("property-value-incorrect-data-type");
    });

    test("returns feature flags' fallback values and calls evaluationWarning callback when contains values with incorrect data types", async () => {
      const warningTypes: EvaluationWarningType[] = [];

      const client = new LoliClient(
        validSpecLoader,
        {},
        {
          evaluationWarning: (type) => {
            warningTypes.push(type);
          },
        },
      );

      const evaluationContext: EvaluationContext = {
        email: 123123,
        settingsFlags: "...",
        subscriptionPlanId: ["enterprise-yearly"],
      };

      const result = await client.evaluateAllFeatureFlags(evaluationContext);

      expect(result).toEqual({
        "ai-pilot": false,
        "dark-mode": false,
        "number-of-workspaces": 0,
        "top-banner": "latest-product",
      });

      await wait(1);

      expect(warningTypes).toContain("property-value-incorrect-data-type");
      expect(warningTypes).not.toContain("property-value-not-found");
    });
  });

  describe("_dangerous.assumeDataIsValidSpec mode", () => {
    describe("spec loading", () => {
      test("client executes failure callback of invalid data type (null)", async () => {
        let loaderFailureCalled = false;
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          (processor) =>
            processor(null as unknown as object, {
              _dangerous: {
                assumeDataIsValidSpec: true,
              },
            }),
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureCalled = true;
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderFailureCalled).toBe(true);
        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "was neither a string nor an object",
        );
      });

      test("client executes failure callback of invalid data type (array)", async () => {
        let loaderFailureCalled = false;
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          (processor) =>
            processor([1, 2] as unknown as object, {
              _dangerous: {
                assumeDataIsValidSpec: true,
              },
            }),
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureCalled = true;
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderFailureCalled).toBe(true);
        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "was neither a string nor an object",
        );
      });

      test("client rejects invalid JSON and calls specLoaderFailure callback", async () => {
        let loaderFailureCalled = false;
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          (processor) =>
            processor(`{"abc: 12true}`, {
              _dangerous: {
                assumeDataIsValidSpec: true,
              },
            }),
          {
            specLoaderMaxRetries: 0,
          },
          {
            specLoaderFailure: (message) => {
              loaderFailureCalled = true;
              loaderFailureMessage = message;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(loaderFailureCalled).toBe(true);
        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain("spec loader failed");
        expect(loaderFailureMessage).toContain("Unterminated string in JSON");
      });

      test("client accepts invalid stringified spec as valid spec", async () => {
        let loadedAndValidatedCalled = false;
        let loadedAndValidatedSpec: unknown = null;
        let processorOnValidCalled = false;

        const client = new LoliClient(
          (processor) =>
            processor(`{"abc": 123}`, {
              _dangerous: {
                assumeDataIsValidSpec: true,
              },
              receivedValidSpec: () => {
                processorOnValidCalled = true;
              },
            }),
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              loadedAndValidatedCalled = true;
              loadedAndValidatedSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(processorOnValidCalled).toBe(false); // receivedValidSpec is skipped in dangerous mode
        expect(loadedAndValidatedCalled).toBe(true);
        expect(loadedAndValidatedSpec).toEqual({ abc: 123 }); // dangerous mode parses stringified docs correctly
        expect(Object.isFrozen(loadedAndValidatedSpec)).toBe(true);
      });

      test("client accepts invalid object as valid spec", async () => {
        let loadedAndValidatedCalled = false;
        let loadedAndValidatedSpec: unknown = null;
        let processorOnValidCalled = false;

        const client = new LoliClient(
          (processor) =>
            processor(
              { abc: true },
              {
                _dangerous: {
                  assumeDataIsValidSpec: true,
                },
                receivedValidSpec: () => {
                  processorOnValidCalled = true;
                },
              },
            ),
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              loadedAndValidatedCalled = true;
              loadedAndValidatedSpec = loadedSpec;
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        expect(processorOnValidCalled).toBe(false); // receivedValidSpec is skipped in dangerous mode
        expect(loadedAndValidatedCalled).toBe(true);
        expect(loadedAndValidatedSpec).toEqual({ abc: true });
        expect(Object.isFrozen(loadedAndValidatedSpec)).toBe(true);
      });
    });

    describe("evaluation", () => {
      test("evaluateBooleanFeatureFlag uses emergency fallback value and calls emergencyFallbackUsed callback", async () => {
        const emergencyFallbackUsedCalls: [string, unknown][] = [];

        const client = new LoliClient(
          (processor) =>
            processor(
              {},
              {
                _dangerous: {
                  assumeDataIsValidSpec: true,
                },
              },
            ),
          {},
          {
            emergencyFallbackUsed: (message, cause) => {
              emergencyFallbackUsedCalls.push([message, cause]);
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        const flagValue = await client.evaluateBooleanFeatureFlag(
          "some-boolean-flag-dangerous-mode",
          {},
        );
        await wait(1);

        expect(flagValue).toBe(false);

        expect(emergencyFallbackUsedCalls).toHaveLength(1);

        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Evaluation of feature flag "some-boolean-flag-dangerous-mode" failed due to an unknown error`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Are you operating in _dangerous.assumeDataIsValidSpec mode?`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `TypeError: Cannot read properties of undefined`,
        );

        expect(emergencyFallbackUsedCalls[0][1]).toBeTruthy();
        expect(emergencyFallbackUsedCalls[0][1] instanceof TypeError).toBe(
          true,
        );
      });

      test("evaluateNumberFeatureFlag uses emergency fallback value and calls emergencyFallbackUsed callback", async () => {
        const emergencyFallbackUsedCalls: [string, unknown][] = [];

        const client = new LoliClient(
          (processor) =>
            processor(
              {},
              {
                _dangerous: {
                  assumeDataIsValidSpec: true,
                },
              },
            ),
          {},
          {
            emergencyFallbackUsed: (message, cause) => {
              emergencyFallbackUsedCalls.push([message, cause]);
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        const flagValue = await client.evaluateNumberFeatureFlag(
          "some-number-flag-dangerous-mode",
          {},
        );
        await wait(1);

        expect(flagValue).toBe(0);

        expect(emergencyFallbackUsedCalls).toHaveLength(1);

        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Evaluation of feature flag "some-number-flag-dangerous-mode" failed due to an unknown error`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Are you operating in _dangerous.assumeDataIsValidSpec mode?`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `TypeError: Cannot read properties of undefined`,
        );

        expect(emergencyFallbackUsedCalls[0][1]).toBeTruthy();
        expect(emergencyFallbackUsedCalls[0][1] instanceof TypeError).toBe(
          true,
        );
      });

      test("evaluateStringFeatureFlag uses emergency fallback value and calls emergencyFallbackUsed callback", async () => {
        const emergencyFallbackUsedCalls: [string, unknown][] = [];

        const client = new LoliClient(
          (processor) =>
            processor(
              {},
              {
                _dangerous: {
                  assumeDataIsValidSpec: true,
                },
              },
            ),
          {},
          {
            emergencyFallbackUsed: (message, cause) => {
              emergencyFallbackUsedCalls.push([message, cause]);
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        const flagValue = await client.evaluateStringFeatureFlag(
          "some-string-flag-dangerous-mode",
          {},
        );
        await wait(1);

        expect(flagValue).toBe("");

        expect(emergencyFallbackUsedCalls).toHaveLength(1);

        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Evaluation of feature flag "some-string-flag-dangerous-mode" failed due to an unknown error`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Are you operating in _dangerous.assumeDataIsValidSpec mode?`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `TypeError: Cannot read properties of undefined`,
        );

        expect(emergencyFallbackUsedCalls[0][1]).toBeTruthy();
        expect(emergencyFallbackUsedCalls[0][1] instanceof TypeError).toBe(
          true,
        );
      });

      test("evaluateAllFeatureFlags uses emergency fallback value and calls emergencyFallbackUsed callback", async () => {
        const emergencyFallbackUsedCalls: [string, unknown][] = [];

        const client = new LoliClient(
          (processor) =>
            processor(
              {},
              {
                _dangerous: {
                  assumeDataIsValidSpec: true,
                },
              },
            ),
          {
            emergencyFallbacksByFeatureFlagName: {
              test: 123,
            },
          },
          {
            emergencyFallbackUsed: (message, cause) => {
              emergencyFallbackUsedCalls.push([message, cause]);
            },
          },
        );

        await client.waitForFirstSpecLoadToFinish();
        await wait(1);

        const allFlagValues = await client.evaluateAllFeatureFlags({});
        await wait(1);

        expect(allFlagValues).toEqual({ test: 123 });

        expect(emergencyFallbackUsedCalls).toHaveLength(1);

        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Evaluation of all feature flags failed due to unknown error`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `Are you operating in _dangerous.assumeDataIsValidSpec mode?`,
        );
        expect(emergencyFallbackUsedCalls[0][0]).toContain(
          `TypeError: Cannot read properties of undefined`,
        );

        expect(emergencyFallbackUsedCalls[0][1]).toBeTruthy();
        expect(emergencyFallbackUsedCalls[0][1] instanceof TypeError).toBe(
          true,
        );
      });
    });
  });
});
