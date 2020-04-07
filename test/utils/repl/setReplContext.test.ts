import { Context } from 'vm';
import { setReplContext } from '../../../src/utils/repl/setReplContext';
import { Registry } from '../../../src/utils/Registry';
import { launch } from '../../../src/utils';

describe('setReplContext', () => {
  it('prefers provided values over registry values', () => {
    Registry.instance().setSelectors({ my: 'selectors' });
    const context: Context = {};
    setReplContext(context, { selectors: {} });
    expect(context.selectors).toEqual({});
  });

  it('sets the registry values', () => {
    const selectors = { input: '#id' };
    Registry.instance().setSelectors(selectors);
    const context: Context = {};
    setReplContext(context);
    expect(context.selectors).toEqual(selectors);
  });

  it('sets the page when there is one', async () => {
    const browser = await launch();

    const browserContext = await browser.newContext();
    Registry.instance().setContext(browserContext);

    const context: Context = {};
    setReplContext(context);
    expect(context.page).toBeUndefined();

    await browserContext.newPage();
    setReplContext(context);

    expect(context.page).toBeDefined();
    await browser.close();
  });

  it('updates the registry values', () => {
    const context: Context = {};

    Registry.instance().setSelectors(undefined);
    setReplContext(context);
    expect(context.selectors).toBeUndefined();

    Registry.instance().setSelectors({});
    expect(context.selectors).toEqual({});
  });
});
