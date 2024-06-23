import type { PropertyCondition } from "../../../../schema/conditions/Condition";

export type OperatorWithoutArrayOperators<CONDITION extends PropertyCondition> =
  Exclude<CONDITION["operator"], "hasElements" | "hasNoElements">;
