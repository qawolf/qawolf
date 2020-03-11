import { basename, join } from 'path';

const DEFAULT_ATTRIBUTE =
  'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/';

const getArtifactPath = (): string | null => {
  let artifactPath = process.env.QAW_ARTIFACT_PATH;
  if (!artifactPath) return null;

  if (require.main) {
    // store artifacts under the name of the main module, if there is one
    // ex. /artifacts/search.test.js
    artifactPath = join(artifactPath, basename(require.main.filename));
  }

  // store artifacts under the name of the browser being tested
  const browserName = process.env.QAW_BROWSER;
  if (browserName && artifactPath) {
    artifactPath = join(artifactPath, browserName);
  }

  return artifactPath;
};

export const CONFIG = {
  artifactPath: getArtifactPath(),
  attribute: process.env.QAW_ATTRIBUTE || DEFAULT_ATTRIBUTE,
};
