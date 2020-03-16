import { join } from 'path';
import { DEFAULT_ATTRIBUTE, loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('loads js config', () => {
    const config = loadConfig(join(__dirname, 'qawolf.config.js'));
    expect(config.attribute).toEqual('id,data-testid');
    expect(config.config).toBeUndefined();
    expect(config.rootDir).toEqual('mytests');
  });

  it('defaults values when there is no config', () => {
    const config = loadConfig('notapath');
    expect(config.attribute).toEqual(DEFAULT_ATTRIBUTE);
    expect(config.config).toEqual('{}');
    expect(config.rootDir).toEqual('.qawolf');
  });
});
