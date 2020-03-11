const DEFAULT_ATTRIBUTE =
  'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/';

export const CONFIG = {
  attribute: process.env.QAW_ATTRIBUTE || DEFAULT_ATTRIBUTE,
};
