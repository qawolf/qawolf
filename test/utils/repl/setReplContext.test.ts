import { Context } from 'vm';
import { setReplContext } from '../../../src/utils/repl/setReplContext';
import { Registry } from '../../../src/utils/Registry';
import { launch } from '../../../src/utils';

describe('setReplContext', () => {
  it('prefers provided values over registry values', () => {
    Registry.instance()._setValue('value', 0);
    const context: Context = {};
    setReplContext(context, { value: 1 });
    expect(context.value).toEqual(1);
  });

  it('sets the registry values', () => {
    Registry.instance()._setValue('value', 0);
    const context: Context = {};
    setReplContext(context);
    expect(context.value).toEqual(0);
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

    Registry.instance()._setValue('value', 0);
    setReplContext(context);
    expect(context.value).toBe(0);

    Registry.instance()._setValue('value', 1);
    expect(context.value).toEqual(1);
  });
});
