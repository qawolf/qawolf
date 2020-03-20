import {
  buildImports,
  buildTemplate,
  buildValidVariableName,
} from '../../src/build-code/buildTemplate';

describe('buildImports', () => {
  it('includes device when specified', () => {
    expect(
      buildImports({
        device: 'iPhone 11',
        name: 'myScript',
      }),
    ).toMatchSnapshot();
  });

  it('imports when typescript', () => {
    expect(
      buildImports({
        name: 'myScript',
        useTypeScript: true,
      }),
    ).toMatchSnapshot();

    expect(
      buildImports({
        device: 'iPhone 11',
        name: 'myScript',
        useTypeScript: true,
      }),
    ).toMatchSnapshot();
  });

  it('requires when not typescript', () => {
    expect(buildImports({ name: 'myScript' })).toMatchSnapshot();
  });

  it('throws an error if device does not exist', () => {
    const testFn = (): string =>
      buildImports({
        device: 'unknown',
        name: 'myTest',
      });
    expect(testFn).toThrowError('Device unknown not available in Playwright');
  });
});

describe('buildTemplate', () => {
  const options = {
    name: 'myName',
    url: 'www.qawolf.com',
  };

  it('builds script template', () => {
    let template = buildTemplate({
      ...options,
      isScript: true,
    });
    expect(template).toMatchSnapshot();

    template = buildTemplate({
      ...options,
      device: 'iPhone 11',
      isScript: true,
    });
    expect(template).toMatchSnapshot();

    template = buildTemplate({
      ...options,
      isScript: true,
      statePath: 'admin.json',
    });
    expect(template).toMatchSnapshot();
  });

  it('builds test template', () => {
    let template = buildTemplate(options);
    expect(template).toMatchSnapshot();

    template = buildTemplate({
      ...options,
      device: 'iPhone 11',
    });
    expect(template).toMatchSnapshot();

    template = buildTemplate({
      ...options,
      statePath: 'admin.json',
    });
    expect(template).toMatchSnapshot();
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
