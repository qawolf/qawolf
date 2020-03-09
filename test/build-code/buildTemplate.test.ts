import {
  buildScriptTemplate,
  buildTestTemplate,
  buildValidVariableName,
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

  it('sets state if statePath specified', () => {
    const template = buildScriptTemplate({
      name: 'myScript',
      statePath: 'admin.json',
      url: 'www.qawolf.com',
    });
    expect(template).toMatchSnapshot();

    const template2 = buildTestTemplate({
      name: 'myTest',
      statePath: 'admin.json',
      url: 'www.qawolf.com',
    });
    expect(template2).toMatchSnapshot();
  });

  it('corrects invalid script names if posssible', () => {
    const template = buildScriptTemplate({
      name: 'my-script',
      url: 'www.qawolf.com',
    });
    expect(template).toMatchSnapshot();
  });

  it('throws errors for script names that will never be valid', () => {
    expect(() =>
      buildScriptTemplate({
        name: 'break',
        url: 'www.qawolf.com',
      }),
    ).toThrowError();
  });
});

describe('buildValidVariableName', () => {
  it('returns valid variable names as is', () => {
    expect(buildValidVariableName('myScript')).toBe('myScript');
    expect(buildValidVariableName('my_script')).toBe('my_script');
    expect(buildValidVariableName('myScript1')).toBe('myScript1');
    expect(buildValidVariableName('$myScript')).toBe('$myScript');
  });

  it('returns corrected invalid variable names', () => {
    expect(buildValidVariableName('my-script')).toBe('myScript');
    expect(buildValidVariableName('my script')).toBe('myScript');
  });

  it('throws error if variable name cannot be corrected', () => {
    expect(() => buildValidVariableName('return')).toThrowError('return');
    expect(() => buildValidVariableName('1myScript')).toThrowError('1myScript');
  });
});
