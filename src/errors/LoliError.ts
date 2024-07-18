import type { LoliErrorType } from "./LoliErrorType";

export class LoliError<TYPE extends LoliErrorType> extends Error {
  public readonly type: TYPE;

  constructor(type: TYPE, message?: string) {
    super(`${type}` + (message ? `: ${message}` : ""));
    this.name = this.constructor.name;
    this.type = type;

    Object.setPrototypeOf(this, LoliError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
