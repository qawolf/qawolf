import { platform } from 'os';
import { getLaunchOptions } from '../../src/utils';

describe('getLaunchOptions', () => {
  it('chooses a browser based on the name', () => {
    const { browserName } = getLaunchOptions({ browserName: 'webkit' });
    expect(browserName).toEqual('webkit');
  });

  it('chooses a browser based on the env variable', () => {
    process.env.QAW_BROWSER = 'firefox';

    const { browserName } = getLaunchOptions();
    expect(browserName).toEqual('firefox');

    process.env.QAW_BROWSER = '';
  });

  it('chooses headless based on the env variable', () => {
    process.env.QAW_HEADLESS = 'false';

    const { headless } = getLaunchOptions();
    expect(headless).toEqual(false);

    process.env.QAW_HEADLESS = '';
  });

  it('on linux chromium, defaults --no-sandbox when no args are provided', () => {
    if (platform() !== 'linux') return;

    process.env.QAW_BROWSER = 'chromium';
    expect(getLaunchOptions().args).toEqual(['--no-sandbox']);
    expect(getLaunchOptions({ args: [] }).args).toEqual([]);

    process.env.QAW_BROWSER = 'webkit';
    expect(getLaunchOptions().args).toEqual([]);
  });
});
