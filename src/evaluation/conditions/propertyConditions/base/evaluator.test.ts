import { describe, expect, jest, test } from "@jest/globals";

import type { PropertyCondition } from "../../../../schema/conditions/Condition";
import type { LoliSpec } from "../../../../schema/LoliSpec";
import type { EvaluationContext } from "../../../EvaluationContext";
import type { EvaluationMetadata } from "../../../EvaluationMetadata";
import type { EvaluationWarningType } from "../../../EvaluationWarningLogging";
import { createPropertyConditionEvaluator } from "./evaluator";

describe("createPropertyConditionEvaluator", () => {
  test("Returns a function", () => {
    const evaluator = createPropertyConditionEvaluator(() => true);
    expect(typeof evaluator).toBe("function");
  });

  describe("Functional tests of returned function", () => {
    const loliSpec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          {
            type: "string",
            id: "idPropId",
            name: "User ID",
            path: ["id"],
            rolloutDiscriminator: true,
          },
          {
            type: "string",
            id: "emailPropId",
            name: "E-Mail",
            path: ["email"],
            rolloutDiscriminator: true,
          },
          {
            type: "number",
            id: "ageId",
            name: "Age",
            path: ["age"],
            rolloutDiscriminator: true,
          },
          {
            type: "boolean",
            id: "isAdminPropId",
            name: "Is Admin Flag",
            path: ["isAdmin"],
            rolloutDiscriminator: true,
          },
        ],
      },
    };

    const evaluationContext: EvaluationContext = {
      id: ["876867576476467547"], // Consciously incorrect data type
      email: "test@acme.com",
      age: 42,
      // isAdmin boolean consciously missing
    };

    test("Returns false for unknown property", () => {
      let warningType: EvaluationWarningType | null = null;

      const evaluationMetadata: EvaluationMetadata = {
        evaluationDateTime: new Date(),
        rolloutGroup: 0,
        warningLogger: (type) => {
          warningType = type;
        },
      };

      const evaluator = createPropertyConditionEvaluator(() => true);

      const condition: PropertyCondition = {
        type: "boolean",
        operator: "isTrue",
        propertyId: "unknownBooleanPropId",
      };

      const evaluationResult = evaluator(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      expect(evaluationResult).toBe(false);
      expect(warningType).toBeNull();
    });

    test("Returns undefined for property with data type not matching the condition type", () => {
      let warningType: EvaluationWarningType | null = null;

      const evaluationMetadata: EvaluationMetadata = {
        evaluationDateTime: new Date(),
        rolloutGroup: 0,
        warningLogger: (type) => {
          warningType = type;
        },
      };

      const evaluator = createPropertyConditionEvaluator(() => true);

      const condition: PropertyCondition = {
        type: "number",
        operator: "equals",
        propertyId: "emailPropId",
        operandsQuantifier: "some",
        operands: [42],
      };

      const evaluationResult = evaluator(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      expect(evaluationResult).toBe(false);
      expect(warningType).toBeNull();
    });

    test("Returns undefined for property value not present in evaluation context", () => {
      let warningType: EvaluationWarningType | null = null;
      let warningMessage: string | null = null;

      const evaluationMetadata: EvaluationMetadata = {
        evaluationDateTime: new Date(),
        rolloutGroup: 0,
        warningLogger: (type, message) => {
          warningType = type;
          warningMessage = message;
        },
      };

      const evaluator = createPropertyConditionEvaluator(() => true);

      const condition: PropertyCondition = {
        type: "boolean",
        operator: "isTrue",
        propertyId: "isAdminPropId",
      };

      const evaluationResult = evaluator(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      expect(evaluationResult).toBe(false);
      expect(warningType).toBe("property-value-not-found");
      expect(warningMessage).toContain("isAdminPropId");
      expect(warningMessage).toContain("Is Admin Flag");
      expect(warningMessage).toContain("isAdmin");
    });

    test("Returns undefined for property value with incorrect data type in evaluation context", () => {
      let warningType: EvaluationWarningType | null = null;
      let warningMessage: string | null = null;

      const evaluationMetadata: EvaluationMetadata = {
        evaluationDateTime: new Date(),
        rolloutGroup: 0,
        warningLogger: (type, message) => {
          warningType = type;
          warningMessage = message;
        },
      };

      const evaluator = createPropertyConditionEvaluator(() => true);

      const condition: PropertyCondition = {
        type: "string",
        operator: "equals",
        propertyId: "idPropId",
        operandsQuantifier: "some",
        operands: ["123123"],
      };

      const evaluationResult = evaluator(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      expect(evaluationResult).toBe(false);
      expect(warningType).toBe("property-value-incorrect-data-type");
      expect(warningMessage).toContain("idPropId");
      expect(warningMessage).toContain("User ID");
      expect(warningMessage).toContain("id");
    });

    test("Calls evaluator function for existing/correct property and returns evaluator result", () => {
      let warningType: EvaluationWarningType | null = null;

      const evaluationMetadata: EvaluationMetadata = {
        evaluationDateTime: new Date(),
        rolloutGroup: 0,
        warningLogger: (type) => {
          warningType = type;
        },
      };

      const evaluateFn = jest.fn(() => true);

      const evaluator = createPropertyConditionEvaluator(evaluateFn);

      const condition: PropertyCondition = {
        type: "string",
        operator: "endsWith",
        propertyId: "emailPropId",
        operandsQuantifier: "some",
        operands: ["@acme.com"],
      };

      const evaluationResult = evaluator(
        condition,
        loliSpec,
        evaluationContext,
        evaluationMetadata,
      );

      expect(evaluationResult).toBe(true);
      expect(evaluateFn).toHaveBeenCalledTimes(1);
      expect(evaluateFn).toHaveBeenCalledWith(condition, "test@acme.com");
      expect(warningType).toBeNull();
    });
  });
});
