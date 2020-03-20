import * as createCommand from '../../src/cli/createCommand';

describe('cli argument parsing', () => {
  let createOptions: createCommand.CreateOptions;

  const runCreateSpy = jest.spyOn(createCommand, 'runCreate');

  runCreateSpy.mockImplementation(async options => {
    createOptions = options;
  });

  const defaultOpts = {
    device: undefined,
    isScript: undefined,
    name: 'example',
    statePath: undefined,
    url: 'http://example.org/',
  };

  const parse = (args: string[]): void => {
    const command = createCommand.buildCreateCommand();
    command.parse(['index.js', 'create', ...args]);
  };

  test('defaults to example.org', () => {
    parse([]);
    expect(createOptions).toEqual(defaultOpts);
  });

  test('device option', () => {
    parse(['--device=iPhone 11', 'google.com']);
    expect(createOptions).toEqual({
      ...defaultOpts,
      device: 'iPhone 11',
      name: 'google',
      url: 'https://google.com/',
    });
  });

  describe('name', () => {
    test('argument', () => {
      parse(['google.com', 'nameFromArgument']);
      expect(createOptions).toEqual({
        ...defaultOpts,
        name: 'nameFromArgument',
        url: 'https://google.com/',
      });
    });

    test('option', () => {
      parse(['--name=nameFromOption', 'google.com']);
      expect(createOptions).toEqual({
        ...defaultOpts,
        name: 'nameFromOption',
        url: 'https://google.com/',
      });
    });

    test('default to url host', () => {
      parse(['myhost.com']);
      expect(createOptions).toEqual({
        ...defaultOpts,
        name: 'myhost',
        url: 'https://myhost.com/',
      });
    });
  });

  test('script option', () => {
    parse(['--script']);
    expect(createOptions).toEqual({
      ...defaultOpts,
      isScript: true,
    });
  });

  test('statePath option', () => {
    parse(['--statePath=myState.json']);
    expect(createOptions).toEqual({
      ...defaultOpts,
      statePath: 'myState.json',
    });
  });
});
