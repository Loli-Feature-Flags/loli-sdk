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

const invalidSchemaSpecLoader: LoliClientSpecLoader = () =>
  Promise.resolve(invalidSchemaSpecStringified);
const semanticIssuesSpecLoader: LoliClientSpecLoader = () =>
  Promise.resolve(semanticIssuesSpecStringified);
const validSpecLoader: LoliClientSpecLoader = () =>
  Promise.resolve(validSpecStringified);

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
  describe("Constructor", () => {
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

      await client.waitForFirstLoadToFinish();
      await wait(1);

      expect(loliSpec).toBeTruthy();
      expect(loliSpec).toEqual(validSpec);
    });

    test("triggers the initial load with object loader", async () => {
      let loliSpec: LoliSpec | null = null;

      const client = new LoliClient(
        () => Promise.resolve(validSpec),
        {},
        {
          specLoadedAndValidated: (loadedSpec) => {
            loliSpec = loadedSpec;
          },
        },
      );

      await client.waitForFirstLoadToFinish();
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

      await client.waitForFirstLoadToFinish();
      await wait(1);

      expect(loliSpec).toBeNull();
    });
  });

  // This implicitly tests createDefaultLoliClientCallbacks()
  describe("Default callbacks", () => {
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

      await client.waitForFirstLoadToFinish();
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain("error 42");
    });

    test("Default specValidationFailure callback logs to console.error", async () => {
      const client = new LoliClient(invalidSchemaSpecLoader, {
        specLoaderMaxRetries: 0,
      });

      await client.waitForFirstLoadToFinish();
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

      await client.waitForFirstLoadToFinish();

      await client.evaluateBooleanFeatureFlag("non-existing-feature-flag", {});
      await wait(1);

      expect(consoleErrorMock).toHaveBeenCalledTimes(1);
      expect(consoleErrorMock.mock.calls[0][0]).toContain("emergency fallback");
    });

    test("Default evaluationWarning callback logs to console.warn", async () => {
      const client = new LoliClient(validSpecLoader, {
        specLoaderMaxRetries: 0,
      });

      await client.waitForFirstLoadToFinish();

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
  });

  describe("Callbacks are called", () => {
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

        await client.waitForFirstLoadToFinish();

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

        await client.waitForFirstLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain("blablabla");
      });

      test("gets called when the loader returns a null result", async () => {
        let loaderFailureMessage: string | null = null;

        const client = new LoliClient(
          () =>
            new Promise((resolve) => {
              resolve(null as unknown as string);
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

        await client.waitForFirstLoadToFinish();

        await wait(1);

        expect(loaderFailureMessage).toBeTruthy();
        expect(loaderFailureMessage).toContain(
          "was neither a string nor an object",
        );
      });
    });

    describe("specValidationFailure", () => {
      test("gets called when the loaded spec is invalid JSON", async () => {
        let callbackMessage: string | null = null;
        let callbackLoaded: unknown = null;
        let callbackCause: unknown = null;

        const client = new LoliClient(
          () => Promise.resolve("{abc}"),
          {
            specLoaderMaxRetries: 0,
          },
          {
            specValidationFailure: (message, loaded, cause) => {
              callbackMessage = message;
              callbackLoaded = loaded;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(callbackMessage).toBeTruthy();
        expect(callbackMessage).toContain("schema or semantic issues");
        expect(callbackLoaded).toBe("{abc}");
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
            specValidationFailure: (message, loaded, cause) => {
              callbackMessage = message;
              callbackLoaded = loaded;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
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
            specValidationFailure: (message, loaded, cause) => {
              callbackMessage = message;
              callbackLoaded = loaded;
              callbackCause = cause;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(callbackMessage).toBeTruthy();
        expect(callbackMessage).toContain("schema or semantic issues");
        expect(callbackLoaded).toBe(semanticIssuesSpecStringified);
        expect(callbackCause instanceof LoliSpecSemanticIssuesError).toBe(true);
      });
    });

    describe("specLoadedAndValidated", () => {
      test("gets called when constructor triggers initial load", async () => {
        let callbackSepc: LoliSpec | null = null;

        const client = new LoliClient(
          validSpecLoader,
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackSepc = loadedSpec;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);
      });

      test("gets called when spec is first loaded via feature flag evaluation", async () => {
        let callbackSepc: LoliSpec | null = null;

        const client = new LoliClient(
          validSpecLoader,
          {
            disableInitialSpecLoadOnCreation: true,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackSepc = loadedSpec;
            },
          },
        );

        await wait(10);

        expect(callbackSepc).toBeNull();

        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(1);

        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);
      });

      test("gets called when spec reload is triggered", async () => {
        let callbackSepc: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {},
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSepc = loadedSpec;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);

        callbackSepc = null;

        client.triggerSpecReload();
        await wait(10);

        expect(callbackCount).toBe(2);
        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);
      });

      test("gets not called when spec is in cache and cache is still valid", async () => {
        let callbackSepc: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {
            specCacheStaleTimeMilliseconds: 250,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSepc = loadedSpec;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);

        // This evaluation call should not trigger a refetch
        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(1);

        expect(callbackCount).toBe(1);
      });

      test("gets called when spec is in cache but cache expired", async () => {
        let callbackSepc: LoliSpec | null = null;
        let callbackCount = 0;

        const client = new LoliClient(
          validSpecLoader,
          {
            specCacheStaleTimeMilliseconds: 250,
          },
          {
            specLoadedAndValidated: (loadedSpec) => {
              callbackCount++;
              callbackSepc = loadedSpec;
            },
          },
        );

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(callbackCount).toBe(1);
        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);

        // This wait should retrigger the spec reloading as then the cache is stale
        callbackSepc = null;
        await wait(300);
        await client.evaluateBooleanFeatureFlag("ai-pilot", {});
        await wait(10);

        expect(callbackCount).toBe(2);
        expect(JSON.stringify(callbackSepc)).toBe(validSpecStringified);
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

        await client.waitForFirstLoadToFinish();

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

        await client.waitForFirstLoadToFinish();
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

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(loaderCounter).toBe(1);
        expect(loliSpec).toBeNull();
      });

      test("Loader is called 6 times if retries = 5 and result of last retry is returned", async () => {
        let loaderCounter = 0;
        let loliSpec: LoliSpec | null = null;

        const client = new LoliClient(
          async () => {
            loaderCounter++;
            await wait(50);

            if (loaderCounter === 6) {
              return validSpec;
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

        await client.waitForFirstLoadToFinish();
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

        await client.waitForFirstLoadToFinish();
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

        await client.waitForFirstLoadToFinish();
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
          async () => {
            await wait(100);
            return validSpec;
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

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(loliSpec).toEqual(validSpec);
        expect(failureCallbackCalled).toBe(false);
      });

      test("load fails if loader is slower than timeout", async () => {
        let loliSpec: LoliSpec | null = null;
        let failureCallbackCalled = false;

        const client = new LoliClient(
          async () => {
            await wait(600);
            return validSpec;
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

        await client.waitForFirstLoadToFinish();
        await wait(1);

        expect(loliSpec).toBeNull();
        expect(failureCallbackCalled).toBe(true);
      });
    });

    describe("cache stale time", () => {
      test("Reload is only executed when triggered after the cache stale time", async () => {
        let loaderCounter = 0;

        const client = new LoliClient(
          async () => {
            loaderCounter++;
            return validSpec;
          },
          {
            specCacheStaleTimeMilliseconds: 500,
          },
        );

        await client.waitForFirstLoadToFinish();
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

  describe("advanced loading behavior checks", () => {
    test("loader is never running multiple times in parallel", async () => {
      let loadedCounter = 0;

      const client = new LoliClient(
        () =>
          new Promise((resolve) => {
            loadedCounter++;
            setTimeout(resolve, 250, validSpec);
          }),
        {
          disableInitialSpecLoadOnCreation: true,
        },
      );

      await client.waitForFirstLoadToFinish();
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

    test("evaluation calls are not blocked by new loading attempts after there has been an initial failed attempt", async () => {
      let loaderFailureCounter = 0;

      const client = new LoliClient(
        () =>
          new Promise((_, reject) =>
            setTimeout(reject, 500, new Error("error 55")),
          ),
        { specLoaderMaxRetries: 0 },
        {
          specLoaderFailure: () => {
            loaderFailureCounter++;
          },
        },
      );

      await client.waitForFirstLoadToFinish();
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
          () => Promise.resolve(""),
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
          () => Promise.resolve(""),
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
          () => Promise.resolve(""),
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
        () => Promise.resolve(""),
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
});
