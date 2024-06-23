import { LoliError } from "../LoliError";
import { LoliErrorType } from "../LoliErrorType";

export class LoliSpecMalformedJsonError extends LoliError<LoliErrorType.SPEC_MALFORMED_JSON> {
  constructor(message: string) {
    super(LoliErrorType.SPEC_MALFORMED_JSON, message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, LoliSpecMalformedJsonError.prototype);
  }
}
