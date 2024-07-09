import type {
  DateTimeConditionOperand,
  DateTimeConditionTimezoneOffsetMode,
} from "../../schema/conditions/DateTimeCondition";

/**
 * Converts a Date instance to a DateTimeCondition operand.
 *
 * This preserves the "local" time without a timezone offset/shift.
 * Still, the timezone offset is stored in the operand's
 * "timezoneOffset" attribute, so the timezone is preserved.
 *
 * @param date Date to be converted.
 * @return Returns DateTimeCondition operand maintaining local date/time details and a timezone offset.
 */
export function dateToDateTimeConditionOperand(
  date: Date,
): DateTimeConditionOperand {
  const year = ("0000" + date.getFullYear().toString()).slice(-4);
  const month = ("00" + (date.getMonth() + 1).toString()).slice(-2);
  const day = ("00" + date.getDate().toString()).slice(-2);

  const hours = ("00" + date.getHours().toString()).slice(-2);
  const minutes = ("00" + date.getMinutes().toString()).slice(-2);
  const seconds = ("00" + date.getSeconds().toString()).slice(-2);

  return {
    // Zod date schema: https://github.com/colinhacks/zod?tab=readme-ov-file#dates
    date: `${year}-${month}-${day}`,
    // Zod time schema: https://github.com/colinhacks/zod?tab=readme-ov-file#times
    time: `${hours}:${minutes}:${seconds}`,
    timezoneOffset: date.getTimezoneOffset() * -1,
  };
}

/**
 * Converts a DateTimeCondition operand to an ISO 8601 date/time
 * string with a timezone offset suffix.
 *
 * You can create a "local" ISO string by setting the timezoneOffsetMode
 * to "localOffset". This creates an ISO string with the same date and time
 * as the operand denotes it, but for the system's timezone.
 *
 * @param operand Operand to be converted.
 * @param timezoneOffsetMode Default "operandOffset". If "operandOffset", the operand's timezone offset is used. If "localOffset", the system's UTC timezone offset is used.
 * @return Returns ISO 86901 date/time string which expresses the same date/time as the operand.
 */
export function dateTimeConditionOperandToIsoString(
  operand: DateTimeConditionOperand,
  timezoneOffsetMode: DateTimeConditionTimezoneOffsetMode = "operandOffset",
): string {
  const timezoneOffset =
    timezoneOffsetMode === "operandOffset"
      ? operand.timezoneOffset
      : new Date().getTimezoneOffset() * -1;

  const timezoneOffsetSeparator: "+" | "-" = timezoneOffset >= 0 ? "+" : "-";

  const timezoneOffsetHours = (
    "00" + Math.floor(Math.abs(timezoneOffset) / 60).toString()
  ).slice(-2);

  const timezoneOffsetMinutes = (
    "00" + Math.floor(Math.abs(timezoneOffset) % 60).toString()
  ).slice(-2);

  return `${operand.date}T${operand.time}${timezoneOffsetSeparator}${timezoneOffsetHours}:${timezoneOffsetMinutes}`;
}

/**
 * Converts a DateTimeCondition operand to a Date instance.
 *
 * Convenience function for "new Date(dateTimeConditionOperandToIsoString(operand))".
 *
 * @param operand Operand to be converted.
 * @param timezoneOffsetMode Default "operandOffset". If "operandOffset", the operand's timezone offset is used. If "localOffset", the system's UTC timezone offset is used.
 * @return Returns Date instance which denotes the same date/time as the operand.
 */
export function dateTimeConditionOperandToDate(
  operand: DateTimeConditionOperand,
  timezoneOffsetMode: DateTimeConditionTimezoneOffsetMode = "operandOffset",
): Date {
  return new Date(
    dateTimeConditionOperandToIsoString(operand, timezoneOffsetMode),
  );
}
