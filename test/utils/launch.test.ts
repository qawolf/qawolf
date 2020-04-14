import { platform } from 'os';
import playwright from 'playwright';
import { getLaunchOptions } from '../../src/utils';
import { getBrowserType } from '../../src/utils/launch';

describe('getBrowserType', () => {
  afterEach(() => jest.resetModules());

  it('returns browser type from playwright if possible', () => {
    const browserType = getBrowserType('webkit');
    expect(browserType).toEqual(playwright.webkit);
  });

  it('returns browser type from flavored package', () => {
    jest.mock('playwright', () => {
      throw new Error("Cannot find module 'playwright'");
    });

    const browserType = getBrowserType('webkit');
    expect(typeof browserType.launch).toEqual('function');
  });

  it('throws an error if cannot import browser type', () => {
    jest.mock('playwright', () => {
      throw new Error("Cannot find module 'playwright'");
    });

    jest.mock('playwright-webkit', () => {
      throw new Error("Cannot find module 'playwright-webkit'");
    });

    expect(() => getBrowserType('webkit')).toThrowError(
      'qawolf requires playwright to be installed',
    );
  });
});

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
