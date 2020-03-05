import { buildScriptTemplate, buildTestTemplate } from '../src/buildTemplate';

describe('buildTemplate', () => {
  it('builds script template', () => {
    const template = buildScriptTemplate('myScript');
    expect(template).toMatchSnapshot();
  });

  it('builds test template', () => {
    const template = buildTestTemplate('myTest');
    expect(template).toMatchSnapshot();
  });
});
