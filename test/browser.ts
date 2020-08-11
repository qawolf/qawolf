import Debug from 'debug';
import { BrowserServer, ChromiumBrowser, chromium } from 'playwright';
import { Registry } from '../src/utils/Registry';

const debug = Debug('qawolf/test:browser');

export const connect = async (): Promise<ChromiumBrowser> => {
  const wsEndpoint = process.env.QAW_WS_ENDPOINT;
  debug('connect to %s', wsEndpoint);

  if (!wsEndpoint) {
    throw new Error('Must provide QAW_WS_ENDPOINT env variable');
  }
  // cast as ChromiumBrowser from playwright-core to make the types work
  const browser = (await chromium.connect({ wsEndpoint })) as ChromiumBrowser;
  Registry.instance().setBrowser(browser);

  debug('connected to browser');
  return browser;
};

export const launchServer = async (): Promise<BrowserServer> => {
  debug('launch server');
  const server = await chromium.launchServer();
  process.env.QAW_WS_ENDPOINT = server.wsEndpoint();

  debug('launched %s', process.env.QAW_WS_ENDPOINT);
  return server;
};
