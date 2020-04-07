import { join } from 'path';
import { DEFAULT_ATTRIBUTE, loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('loads js config', () => {
    const config = loadConfig(join(__dirname, 'qawolf.config.js'));
    expect(config.attribute).toEqual('id,data-testid');
    expect(config.config).toBeUndefined();
    expect(config.createTemplate({ name: 'hello', url: 'google.com' })).toMatch(
      'test,hello,google.com',
    );
    expect(config.rootDir).toEqual('mytests');
    expect(config.testTimeout).toEqual(120000);
    expect(config.watch).toEqual(false);
  });

  it('defaults values when there is no config', () => {
    const config = loadConfig('notapath');
    expect(config.attribute).toEqual(DEFAULT_ATTRIBUTE);
    expect(config.config).toEqual('{}');
    expect(config.createTemplate).toBeUndefined();
    expect(config.rootDir).toEqual('.qawolf');
    expect(config.testTimeout).toEqual(60000);
    expect(config.watch).toEqual(true);
  });
});
