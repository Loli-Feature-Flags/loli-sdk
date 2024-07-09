import { describe, expect, test } from "@jest/globals";

import type { DateTimeConditionOperand } from "../../schema/conditions/DateTimeCondition";
import {
  dateTimeConditionOperandToDate,
  dateTimeConditionOperandToIsoString,
  dateToDateTimeConditionOperand,
} from "./datetime";

describe("dateToDateTimeConditionOperand", () => {
  test("Returns correct local date", () => {
    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T09:30:15.123+02:00"))
        .date,
    ).toEqual("2024-05-27");

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999-04:00"))
        .date,
    ).toEqual("2024-05-28");

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999+06:00"))
        .date,
    ).toEqual("2024-05-27");
  });

  test("Returns correct local time", () => {
    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T09:30:15.123+02:00"))
        .time,
    ).toEqual("09:30:15");

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999-04:00"))
        .time,
    ).toEqual("05:59:59");

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999+06:00"))
        .time,
    ).toEqual("19:59:59");
  });

  test("Returns correct timezone offset", () => {
    const expectedTimezoneOffset = new Date().getTimezoneOffset() * -1;

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T09:30:15.123+02:00"))
        .timezoneOffset,
    ).toBe(expectedTimezoneOffset);

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999-04:00"))
        .timezoneOffset,
    ).toEqual(expectedTimezoneOffset);

    expect(
      dateToDateTimeConditionOperand(new Date("2024-05-27T23:59:59.999+06:00"))
        .timezoneOffset,
    ).toEqual(expectedTimezoneOffset);
  });

  test("Returns padded year, month, and day", () => {
    expect(
      dateToDateTimeConditionOperand(new Date("0002-01-02T09:30:15.123")).date,
    ).toEqual("0002-01-02");
  });

  test("Returns padded hours, minutes, and seconds", () => {
    expect(
      dateToDateTimeConditionOperand(new Date("2024-07-09T04:05:06.123")).time,
    ).toEqual("04:05:06");
  });
});

describe("dateTimeConditionOperandToIsoString", () => {
  test("Returns correct ISO string including negative timezone offset", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: -120,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30-02:00");
  });

  test("Returns correct ISO string including negative timezone offset with minutes", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: -150,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30-02:30");
  });

  test("Returns correct ISO string including negative timezone offset", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: -120,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30-02:00");
  });

  test("Returns correct ISO string including zero timezone offset", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: 0,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30+00:00");
  });

  test("Returns correct ISO string including positive timezone offset", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: +240,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30+04:00");
  });

  test("Returns correct ISO string including positive timezone offset with minutes", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: +308,
    };

    const isoString = dateTimeConditionOperandToIsoString(operand);

    expect(isoString).toEqual("2024-05-27T10:45:30+05:08");
  });

  test("Returns correct ISO string for local timezone offset (Berlin +02:00)", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: -420,
    };

    const isoString = dateTimeConditionOperandToIsoString(
      operand,
      "localOffset",
    );

    expect(isoString).toEqual("2024-05-27T10:45:30+02:00");
  });
});

describe("dateTimeConditionOperandToDate", () => {
  test("Returns date with correct time", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: +308,
    };

    expect(dateTimeConditionOperandToDate(operand).getTime()).toBe(
      new Date(dateTimeConditionOperandToIsoString(operand)).getTime(),
    );
  });

  test("Returns date with correct time for local offset", () => {
    const operand: DateTimeConditionOperand = {
      date: "2024-05-27",
      time: "10:45:30",
      timezoneOffset: +308,
    };

    expect(
      dateTimeConditionOperandToDate(operand, "localOffset").getTime(),
    ).toBe(
      new Date(
        dateTimeConditionOperandToIsoString(operand, "localOffset"),
      ).getTime(),
    );
  });

  test("Returns date instance with same millis as operand input", () => {
    const isoInput = "2024-05-27T10:00:00+02:00";
    const date = new Date(isoInput);
    const operand = dateToDateTimeConditionOperand(date);

    expect(dateTimeConditionOperandToDate(operand).getTime()).toBe(
      date.getTime(),
    );
  });
});
