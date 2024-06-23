import type { ZodIssue } from "zod";

import { LoliError } from "../LoliError";
import { LoliErrorType } from "../LoliErrorType";

export class LoliSpecInvalidSchemaError extends LoliError<LoliErrorType.SPEC_INVALID_SCHEMA> {
  constructor(
    public readonly allErrorsMessage: string,
    public readonly errors: ZodIssue[],
  ) {
    super(LoliErrorType.SPEC_INVALID_SCHEMA, allErrorsMessage);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, LoliSpecInvalidSchemaError.prototype);
  }
}
