import { join } from 'path';
import { DEFAULT_ATTRIBUTE, loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('loads js config', () => {
    const config = loadConfig(join(__dirname, 'qawolf.config.js'));
    expect(config.attribute).toEqual('id,data-testid');
    expect(config.config).toBeUndefined();

    expect(
      config.createScriptTemplate({ name: 'hello', url: 'google.com' }),
    ).toMatch('script,hello,google.com');

    expect(
      config.createTestTemplate({ name: 'hello', url: 'google.com' }),
    ).toMatch('test,hello,google.com');

    expect(config.rootDir).toEqual('mytests');

    expect(config.testTimeout).toEqual(120000);
  });

  it('defaults values when there is no config', () => {
    const config = loadConfig('notapath');
    expect(config.attribute).toEqual(DEFAULT_ATTRIBUTE);
    expect(config.config).toEqual('{}');
    expect(config.createScriptTemplate).toBeUndefined();
    expect(config.createTestTemplate).toBeUndefined();
    expect(config.rootDir).toEqual('.qawolf');
    expect(config.testTimeout).toEqual(60000);
  });
});
