import { describe, expect, test } from "@jest/globals";

import type {
  DateTimeCondition,
  DateTimeConditionOperator,
  DateTimeConditionTimezoneOffsetMode,
} from "../../schema/conditions/DateTimeCondition";
import {
  DateTimeConditionOperators,
  DateTimeConditionTimezoneOffsetModes,
} from "../../schema/conditions/DateTimeCondition";
import type { EvaluationMetadata } from "../EvaluationMetadata";
import { evaluateDateTimeCondition } from "./dateTimeCondition";

describe("evaluateDateTimeCondition", () => {
  const evaluationMetadata: EvaluationMetadata = {
    evaluationDateTime: new Date("2024-06-12T08:00:00.000+02:00"),
    rolloutGroup: 0,
  };

  const testCases: {
    [key in DateTimeConditionOperator]: {
      [key in DateTimeConditionTimezoneOffsetMode]: {
        operand: DateTimeCondition["operand"];
        expected: boolean;
      }[];
    };
  } = {
    equalsOrIsAfter: {
      localOffset: [
        {
          operand: {
            date: "2024-06-12",
            time: "16:00:00",
            timezoneOffset: 620, // must not have any effect
          },
          expected: false,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "08:00:00",
            timezoneOffset: -500, // must not have any effect
          },
          expected: true,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "07:59:59",
            timezoneOffset: 700, // must not have any effect
          },
          expected: true,
        },
      ],
      operandOffset: [
        {
          operand: {
            date: "2024-06-12",
            time: "06:00:00",
            timezoneOffset: -240,
          },
          expected: false,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "04:00:00",
            timezoneOffset: -120,
          },
          expected: true,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "12:00:00",
            timezoneOffset: 361, // One minute before evaluation date/time
          },
          expected: true,
        },
      ],
    },
    isBefore: {
      localOffset: [
        {
          operand: {
            date: "2024-06-12",
            time: "16:00:00",
            timezoneOffset: 620, // must not have any effect
          },
          expected: true,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "08:00:00",
            timezoneOffset: -500, // must not have any effect
          },
          expected: false,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "07:59:59",
            timezoneOffset: 700, // must not have any effect
          },
          expected: false,
        },
      ],
      operandOffset: [
        {
          operand: {
            date: "2024-06-12",
            time: "06:00:00",
            timezoneOffset: -240,
          },
          expected: true,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "04:00:00",
            timezoneOffset: -120,
          },
          expected: false,
        },
        {
          operand: {
            date: "2024-06-12",
            time: "12:00:00",
            timezoneOffset: 361, // One minute before evaluation date/time
          },
          expected: false,
        },
      ],
    },
  };

  for (const operator of DateTimeConditionOperators) {
    describe(`Operator = ${operator}`, () => {
      for (const timezoneOffsetMode of DateTimeConditionTimezoneOffsetModes) {
        describe(`Timezone offset mode = ${timezoneOffsetMode}`, () => {
          for (const { expected, operand } of testCases[operator][
            timezoneOffsetMode
          ]) {
            test(`Returns ${expected} for operand: ${JSON.stringify(operand)}`, () => {
              const conditon: DateTimeCondition = {
                type: "dateTime",
                operator,
                operand,
                timezoneOffsetMode,
              };

              expect(
                evaluateDateTimeCondition(conditon, evaluationMetadata),
              ).toBe(expected);
            });
          }
        });
      }
    });
  }
});
