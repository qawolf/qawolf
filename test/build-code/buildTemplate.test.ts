import {
  buildScriptTemplate,
  buildTestTemplate,
} from '../../src/build-code/buildTemplate';

describe('buildTemplate', () => {
  it('builds script template', () => {
    const template = buildScriptTemplate({
      name: 'myScript',
      url: 'www.qawolf.com',
    });
    expect(template).toMatchSnapshot();
  });

  it('builds test template', () => {
    const template = buildTestTemplate({
      name: 'myTest',
      url: 'www.qawolf.com',
    });
    expect(template).toMatchSnapshot();
  });

  it('throws an error if device does not exist', () => {
    const testFn = (): string =>
      buildTestTemplate({
        device: 'unknown',
        name: 'myTest',
        url: 'www.qawolf.com',
      });
    expect(testFn).toThrowError('Device unknown not available in Playwright');
  });

  it('includes device if specified', () => {
    const template = buildScriptTemplate({
      device: 'iPhone 11',
      name: 'myScript',
      url: 'www.qawolf.com',
    });
    expect(template).toMatchSnapshot();

    const template2 = buildTestTemplate({
      device: 'iPad Mini',
      name: 'myTest',
      url: 'www.qawolf.com',
    });
    expect(template2).toMatchSnapshot();
  });
});
