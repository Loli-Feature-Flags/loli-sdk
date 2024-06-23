import type { Path } from "../../types/Path";
import type { SemanticIssue } from "../../validation/semantic/SemanticIssue";
import type { SemanticValidation } from "../../validation/semantic/SemanticValidation";
import { LoliError } from "../LoliError";
import { LoliErrorType } from "../LoliErrorType";

export class LoliSpecSemanticIssuesError extends LoliError<LoliErrorType.SPEC_SEMANTIC_ISSUES> {
  constructor(private readonly semanticValidation: SemanticValidation) {
    super(LoliErrorType.SPEC_SEMANTIC_ISSUES);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, LoliSpecSemanticIssuesError.prototype);
  }

  getIssues(): SemanticIssue[] {
    return this.semanticValidation.getIssues();
  }

  getIssuesByPartialPath(partialPath: Path): SemanticIssue[] {
    return this.semanticValidation.getIssuesByPartialPath(partialPath);
  }

  getIssuesByPath(path: Path): SemanticIssue[] {
    return this.semanticValidation.getIssuesByPath(path);
  }
}
