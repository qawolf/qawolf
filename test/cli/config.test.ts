import { join } from 'path';
import { loadConfig } from '../../src/cli/config';

describe('loadConfig', () => {
  it('loads js config', () => {
    const config = loadConfig(join(__dirname, 'qawolf.config.js'));
    expect(config.rootDir).toEqual('mytests');
  });

  it('defaults values when there is no config', () => {
    const config = loadConfig('notapath');
    expect(config.rootDir).toEqual('.qawolf/tests');
  });
});
