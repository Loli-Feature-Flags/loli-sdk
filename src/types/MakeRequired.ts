export type MakeRequired<TYPE, REQUIRED_FIELDS extends keyof TYPE> = Required<
  Pick<TYPE, REQUIRED_FIELDS>
> &
  TYPE;
