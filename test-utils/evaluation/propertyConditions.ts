import { describe, expect, test } from "@jest/globals";

import type { EvaluationContext } from "../../src/evaluation/EvaluationContext";
import type { EvaluationMetadata } from "../../src/evaluation/EvaluationMetadata";
import type { BooleanArrayCondition } from "../../src/schema/conditions/BooleanArrayCondition";
import type { BooleanCondition } from "../../src/schema/conditions/BooleanCondition";
import type {
  PropertyArrayCondition,
  PropertyCondition,
} from "../../src/schema/conditions/Condition";
import type { Quantifier } from "../../src/schema/conditions/Quantifier";
import type { LoliSpec } from "../../src/schema/LoliSpec";
import type { Property } from "../../src/schema/Property";

export type PropertyConditionOperatorTestCaseRecordBase<
  CONDITION extends PropertyCondition,
  VALUE,
> = {
  value: VALUE;
  expected: boolean;
} & (CONDITION extends { operands: Array<infer AV> }
  ? { operands: Array<AV> }
  : {});

export type PropertyConditionOperatorTestCaseRecord<
  CONDITION extends PropertyCondition,
  VALUE,
> = PropertyConditionOperatorTestCaseRecordBase<CONDITION, VALUE> &
  (CONDITION extends {
    propertyArrayQuantifier: Quantifier;
  }
    ? {
        propertyArrayQuantifier: Quantifier;
      }
    : {}) &
  (CONDITION extends {
    operandsQuantifier: Quantifier;
  }
    ? {
        operandsQuantifier: Quantifier;
      }
    : {});

export type PropertyConditionOperatorTestCases<
  CONDITION extends PropertyCondition,
  VALUE,
> = {
  [key in CONDITION["operator"]]: PropertyConditionOperatorTestCaseRecord<
    CONDITION,
    VALUE
  >[];
};

export type OperatorTestCreateConditionProps<
  CONDITION extends PropertyCondition,
> = {
  operator: CONDITION["operator"];
} & (CONDITION extends {
  propertyArrayQuantifier: Quantifier;
}
  ? {
      propertyArrayQuantifier: Quantifier;
    }
  : {}) &
  (CONDITION extends {
    operandsQuantifier: Quantifier;
  }
    ? {
        operandsQuantifier: Quantifier;
      }
    : {}) &
  (CONDITION extends { operands: Array<infer AV> }
    ? { operands: Array<AV> }
    : {});

export type ExecuteConditionTestsProps<
  CONDITION extends PropertyCondition,
  VALUE,
> = {
  evaluateCondition: (
    condition: CONDITION,
    loliSpec: LoliSpec,
    evaluationContext: EvaluationContext,
    evaluationMetadata: EvaluationMetadata,
  ) => boolean;
  strictFalseTests: {
    createCondition: (propertyId: string) => CONDITION;
    property: Property;
    propertyMissingInEvaluationContext: Property;
    propertyWithIncorrectDataTypeInSpec: Property;
    propertyWithIncorrectEvaluationContextValueDataType: Property;
    evaluationContext: EvaluationContext;
  };
  operatorTests: {
    cases: PropertyConditionOperatorTestCases<CONDITION, VALUE>;
    createCondition: (
      props: OperatorTestCreateConditionProps<CONDITION>,
    ) => CONDITION;
    property: Property & { type: CONDITION["type"] };
    createEvaluationContext: (expected: VALUE) => EvaluationContext;
  };
};

export function executePropertyConditionTests<
  CONDITION extends PropertyCondition,
  VALUE,
>(options: ExecuteConditionTestsProps<CONDITION, VALUE>) {
  const { evaluateCondition, strictFalseTests, operatorTests } = options;

  const defaultEvaluationMetadata: EvaluationMetadata = {
    evaluationDateTime: new Date(),
    rolloutGroup: 0,
  };

  describe("Strict false cases", () => {
    const {
      createCondition,
      property,
      propertyWithIncorrectDataTypeInSpec,
      propertyWithIncorrectEvaluationContextValueDataType,
      propertyMissingInEvaluationContext,
      evaluationContext,
    } = strictFalseTests;

    const spec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [
          property,
          propertyWithIncorrectDataTypeInSpec,
          propertyMissingInEvaluationContext,
          propertyWithIncorrectEvaluationContextValueDataType,
        ],
      },
    };

    test("Returns false for unknown property", () => {
      expect(
        evaluateCondition(
          createCondition("9as76dv8a67s5db78sr5dba765s4rdva67"),
          spec,
          evaluationContext,
          defaultEvaluationMetadata,
        ),
      ).toBe(false);
    });

    test("Returns false for property with different data type", () => {
      expect(
        evaluateCondition(
          createCondition(propertyWithIncorrectDataTypeInSpec.id),
          spec,
          evaluationContext,
          defaultEvaluationMetadata,
        ),
      ).toBe(false);
    });

    test("Returns false for property values that does not exist in the evaluation context", () => {
      expect(
        evaluateCondition(
          createCondition(propertyMissingInEvaluationContext.id),
          spec,
          evaluationContext,
          defaultEvaluationMetadata,
        ),
      ).toBe(false);
    });

    test("Returns false for property value which is not a boolean", () => {
      expect(
        evaluateCondition(
          createCondition(
            propertyWithIncorrectEvaluationContextValueDataType.id,
          ),
          spec,
          evaluationContext,
          defaultEvaluationMetadata,
        ),
      ).toBe(false);
    });
  });

  describe("Operator test cases", () => {
    const { cases, createCondition, property, createEvaluationContext } =
      operatorTests;

    const spec: LoliSpec = {
      schemaVersion: 1,
      featureFlags: [],
      segments: [],
      evaluationContext: {
        properties: [property],
      },
    };

    const operators = Object.keys(cases) as unknown as CONDITION["operator"][];

    for (const operator of operators) {
      describe(`Operator "${operator}"`, () => {
        const operatorCases = cases[operator];

        for (const operatorCase of operatorCases) {
          const { value, expected } = operatorCase;

          const caseWithOptionalQuantifiers = operatorCase as unknown as {
            propertyArrayQuantifier?: Quantifier;
            operandsQuantifier?: Quantifier;
            operands?: unknown[];
          };

          let testCaseTitle = `Returns ${expected} for: `;

          if (caseWithOptionalQuantifiers.propertyArrayQuantifier) {
            testCaseTitle += `Array quantifier = ${caseWithOptionalQuantifiers.propertyArrayQuantifier}; `;
          }

          if (caseWithOptionalQuantifiers.operandsQuantifier) {
            testCaseTitle += `Operands quantifier = ${caseWithOptionalQuantifiers.operandsQuantifier}; `;
          }

          if (caseWithOptionalQuantifiers.operands) {
            testCaseTitle += `Operands = ${JSON.stringify(caseWithOptionalQuantifiers.operands)}; `;
          }

          testCaseTitle += `Value = ${JSON.stringify(value)}`;

          test(testCaseTitle, () => {
            const condition = createCondition({
              operator,
              propertyArrayQuantifier:
                caseWithOptionalQuantifiers.propertyArrayQuantifier,
              operandsQuantifier:
                caseWithOptionalQuantifiers.operandsQuantifier,
              operands: caseWithOptionalQuantifiers.operands,
            } as unknown as OperatorTestCreateConditionProps<CONDITION>);

            const evaluationContext = createEvaluationContext(value);

            expect(
              evaluateCondition(
                condition,
                spec,
                evaluationContext,
                defaultEvaluationMetadata,
              ),
            ).toEqual(expected);
          });
        }
      });
    }
  });
}

export function createTestCasesByPropertyArrayQuantifier<
  CONDITION extends PropertyArrayCondition,
  VALUE,
>(testCasesForPropertyArrayQuantifier: {
  [propertyArrayQuantifier in Quantifier]: PropertyConditionOperatorTestCaseRecordBase<
    CONDITION,
    VALUE
  >[];
}): PropertyConditionOperatorTestCaseRecord<CONDITION, VALUE>[] {
  const fullTestCases: PropertyConditionOperatorTestCaseRecord<
    CONDITION,
    VALUE
  >[] = [];

  for (const propertyArrayQuantifier of Object.keys(
    testCasesForPropertyArrayQuantifier,
  ) as Quantifier[]) {
    for (const { expected, value } of testCasesForPropertyArrayQuantifier[
      propertyArrayQuantifier
    ]) {
      fullTestCases.push({
        expected,
        value,
        propertyArrayQuantifier,
      } as unknown as PropertyConditionOperatorTestCaseRecord<
        CONDITION,
        VALUE
      >);
    }
  }

  return fullTestCases;
}

export function createTestCasesByOperandsQuantifier<
  CONDITION extends Exclude<
    PropertyCondition,
    BooleanCondition | BooleanArrayCondition
  >,
  VALUE,
>(testCasesByOperandsQuantifier: {
  [operandsQuantifier in Quantifier]: PropertyConditionOperatorTestCaseRecordBase<
    CONDITION,
    VALUE
  >[];
}): PropertyConditionOperatorTestCaseRecord<CONDITION, VALUE>[] {
  const fullTestCases: PropertyConditionOperatorTestCaseRecord<
    CONDITION,
    VALUE
  >[] = [];

  for (const operandsQuantifier of Object.keys(
    testCasesByOperandsQuantifier,
  ) as Quantifier[]) {
    for (const { expected, operands, value } of testCasesByOperandsQuantifier[
      operandsQuantifier
    ] as unknown as {
      expected: boolean;
      value: VALUE;
      operands: unknown[];
    }[]) {
      fullTestCases.push({
        expected,
        value,
        operands,
        operandsQuantifier,
      } as unknown as PropertyConditionOperatorTestCaseRecord<
        CONDITION,
        VALUE
      >);
    }
  }

  return fullTestCases;
}

export function createTestCasesByPropertyArrayAndOperandsQuantifiers<
  CONDITION extends PropertyArrayCondition,
  VALUE,
>(testCasesForPropertyArrayAndOperandsQuantifiers: {
  [propertyArrayQuantifier in Quantifier]: {
    [operandsQuantifier in Quantifier]: PropertyConditionOperatorTestCaseRecordBase<
      CONDITION,
      VALUE
    >[];
  };
}): PropertyConditionOperatorTestCaseRecord<CONDITION, VALUE>[] {
  const fullTestCases: PropertyConditionOperatorTestCaseRecord<
    CONDITION,
    VALUE
  >[] = [];

  for (const propertyArrayQuantifier of Object.keys(
    testCasesForPropertyArrayAndOperandsQuantifiers,
  ) as Quantifier[]) {
    for (const operandsQuantifier of Object.keys(
      testCasesForPropertyArrayAndOperandsQuantifiers[propertyArrayQuantifier],
    ) as Quantifier[]) {
      for (const {
        expected,
        value,
        operands,
      } of testCasesForPropertyArrayAndOperandsQuantifiers[
        propertyArrayQuantifier
      ][operandsQuantifier] as unknown as {
        expected: boolean;
        value: VALUE;
        operands: unknown[];
      }[]) {
        fullTestCases.push({
          expected,
          value,
          operands,
          propertyArrayQuantifier,
          operandsQuantifier,
        } as unknown as PropertyConditionOperatorTestCaseRecord<
          CONDITION,
          VALUE
        >);
      }
    }
  }

  return fullTestCases;
}
