import { getArtifactPath } from '../../src/utils/context/register';

describe('getArtifactPath', () => {
  it('returns null when there is no artifact path', () => {
    delete process.env.QAW_ARTIFACT_PATH;
    expect(getArtifactPath()).toEqual(null);
  });

  it('includes the main module path', () => {
    process.env.QAW_ARTIFACT_PATH = '/artifacts';
    delete process.env.QAW_BROWSER;
    expect(getArtifactPath().replace(/\\/g, '/')).toEqual(
      '/artifacts/register.test.ts',
    );
  });

  it('includes the browser path', () => {
    process.env.QAW_ARTIFACT_PATH = '/artifacts';
    process.env.QAW_BROWSER = 'firefox';
    expect(getArtifactPath().replace(/\\/g, '/')).toContain(
      '/artifacts/register.test.ts/firefox',
    );
  });
});
