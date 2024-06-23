import { describe, expect, test } from "@jest/globals";

import type { StringConditionOperator } from "../../../../../schema/conditions/StringCondition";
import { evaluateStringValueOperatorAndOperand } from "./string";

describe("evaluateStringValueOperatorAndOperand", () => {
  const testCases: {
    [key in StringConditionOperator]: {
      value: string;
      operand: string;
      expected: boolean;
    }[];
  } = {
    equals: [
      { value: "", operand: "", expected: true },
      { value: "", operand: "   ", expected: false },
      { value: "", operand: "foo", expected: false },
      { value: "foo", operand: "", expected: false },
      { value: "foo", operand: "foo", expected: true },
      { value: "foo", operand: "FOO", expected: false },
      { value: "   ", operand: "   ", expected: true },
    ],
    doesNotEqual: [
      { value: "", operand: "", expected: false },
      { value: "", operand: "   ", expected: true },
      { value: "", operand: "foo", expected: true },
      { value: "foo", operand: "", expected: true },
      { value: "foo", operand: "foo", expected: false },
      { value: "foo", operand: "FOO", expected: true },
      { value: "   ", operand: "   ", expected: false },
    ],
    startsWith: [
      { value: "fooBarHelloWorld", operand: "", expected: true },
      { value: "fooBarHelloWorld", operand: "fooBar", expected: true },
      { value: "fooBarHelloWorld", operand: "FOOBAR", expected: false },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorld",
        expected: true,
      },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorldAndMore",
        expected: false,
      },
      { value: "fooBarHelloWorld", operand: "different", expected: false },
    ],
    doesNotStartWith: [
      { value: "fooBarHelloWorld", operand: "", expected: false },
      { value: "fooBarHelloWorld", operand: "fooBar", expected: false },
      { value: "fooBarHelloWorld", operand: "FOOBAR", expected: true },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorld",
        expected: false,
      },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorldAndMore",
        expected: true,
      },
      { value: "fooBarHelloWorld", operand: "different", expected: true },
    ],
    endsWith: [
      { value: "fooBarHelloWorld", operand: "", expected: true },
      { value: "fooBarHelloWorld", operand: "HelloWorld", expected: true },
      { value: "fooBarHelloWorld", operand: "HELLOWORLD", expected: false },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorld",
        expected: true,
      },
      {
        value: "fooBarHelloWorld",
        operand: "more_fooBarHelloWorld",
        expected: false,
      },
      { value: "fooBarHelloWorld", operand: "different", expected: false },
    ],
    doesNotEndWith: [
      { value: "fooBarHelloWorld", operand: "", expected: false },
      { value: "fooBarHelloWorld", operand: "HelloWorld", expected: false },
      { value: "fooBarHelloWorld", operand: "HELLOWORLD", expected: true },
      {
        value: "fooBarHelloWorld",
        operand: "fooBarHelloWorld",
        expected: false,
      },
      {
        value: "fooBarHelloWorld",
        operand: "more_fooBarHelloWorld",
        expected: true,
      },
      { value: "fooBarHelloWorld", operand: "different", expected: true },
    ],
    matchesRegex: [
      // Just some random samples to test regex functionality
      { value: "foo_bar", operand: "foo_(bar|test)", expected: true },
      { value: "foo_test", operand: "foo_(bar|test)", expected: true },
      {
        value: "hello-world-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: true,
      },
      {
        value: "hello-world-123",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: false,
      },
      {
        value: "1234-world-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: false,
      },
      {
        value: "hello-wor55-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: true,
      },
      {
        value: "hELlo-wor55-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: false,
      },
    ],
    doesNotMatchRegex: [
      // Just some random samples to test regex functionality
      { value: "foo_bar", operand: "foo_(bar|test)", expected: false },
      { value: "foo_test", operand: "foo_(bar|test)", expected: false },
      {
        value: "hello-world-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: false,
      },
      {
        value: "hello-world-123",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: true,
      },
      {
        value: "1234-world-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: true,
      },
      {
        value: "hello-wor55-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: false,
      },
      {
        value: "hELlo-wor55-1234",
        operand: "^[a-z]+\\-\\w+\\-[1-9]{4}$",
        expected: true,
      },
    ],
    isBlank: [
      { value: "", operand: "", expected: true },
      { value: "", operand: "asdf", expected: true },
      { value: "   ", operand: "", expected: true },
      { value: "   ", operand: "asdf", expected: true },
      { value: "\n   \n\n   ", operand: "", expected: true },
      { value: "\n   \n\n   ", operand: "asdf", expected: true },
      { value: "fooBar", operand: "", expected: false },
      { value: "fooBar", operand: "asdf", expected: false },
    ],
    isNotBlank: [
      { value: "", operand: "", expected: false },
      { value: "", operand: "asdf", expected: false },
      { value: "   ", operand: "", expected: false },
      { value: "   ", operand: "asdf", expected: false },
      { value: "\n   \n\n   ", operand: "", expected: false },
      { value: "\n   \n\n   ", operand: "asdf", expected: false },
      { value: "fooBar", operand: "", expected: true },
      { value: "fooBar", operand: "asdf", expected: true },
    ],
  };

  for (const [operator, operatorTestCases] of Object.entries(testCases)) {
    describe(`Operator ${operator}`, () => {
      for (const { expected, value, operand } of operatorTestCases) {
        test(`Returns ${expected} for value = ${JSON.stringify(value)} and operand = ${JSON.stringify(operand)}`, () => {
          expect(
            evaluateStringValueOperatorAndOperand(
              value,
              operator as StringConditionOperator,
              operand,
            ),
          ).toBe(expected);
        });
      }
    });
  }
});
