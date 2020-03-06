const DEFAULT_ATTRIBUTE =
  'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/';

export const CONFIG = {
  artifactPath: process.env.QAW_ARTIFACT_PATH,
  attribute: process.env.QAW_ATTRIBUTE || DEFAULT_ATTRIBUTE,
};
