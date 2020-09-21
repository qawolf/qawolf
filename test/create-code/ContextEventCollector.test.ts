import { Browser, BrowserContext, ChromiumBrowserContext } from 'playwright';
import { isKeyEvent } from '../../src/build-workflow/event';
import { ContextEventCollector } from '../../src/create-code/ContextEventCollector';
import {
  ElementEvent,
  InputEvent,
  KeyEvent,
  PasteEvent,
  ScrollEvent,
} from '../../src/types';
import { getLaunchOptions, launch, register, waitFor } from '../../src/utils';
import { sleep, TEST_URL } from '../utils';

describe('ContextEventCollector', () => {
  let browser: Browser;
  let context: BrowserContext;
  let events: ElementEvent[];
  let windowEvents: ElementEvent[];

  beforeAll(async () => {
    browser = await launch();
    context = await browser.newContext();
    await register(context);

    const collector = await ContextEventCollector.create(context);
    collector.on('elementevent', (event) => events.push(event));
    collector.on('windowevent', (event) => windowEvents.push(event));
  });

  beforeEach(() => {
    events = [];
    windowEvents = [];
  });

  afterAll(() => browser.close());

  it('collects (click) events from multiple pages', async () => {
    for (let i = 0; i < 2; i++) {
      const page = await context.newPage();
      await page.goto(TEST_URL);
      await page.click('a');
      await page.close();
    }

    expect(events.map((e) => e.page)).toEqual([0, 0, 1, 1]);
    expect(events.map((e) => e.name)).toEqual([
      'mousedown',
      'click',
      'mousedown',
      'click',
    ]);

    expect(events.map((e) => e.selector)).toEqual([
      'text=Buttons',
      'text=Buttons',
      'text=Buttons',
      'text=Buttons',
    ]);
  });

  it('collects frame selector and index', async () => {
    // this only works properly with chromium which is fine since that is what we record with
    if (getLaunchOptions().browserName !== 'chromium') return;

    const page = await context.newPage();

    await page.goto(`${TEST_URL}iframes`);

    const frame = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    await frame.click('[data-qa="reload-top"]');
    await waitFor(() => events.length > 0);
    expect(events[0].frameSelector).toEqual('[data-qa="first"]');
    expect(events[0].selector).toEqual('[data-qa="reload-top"]');

    const frame2 = await (
      await page.waitForSelector('iframe[src="/buttons"]')
    ).contentFrame();
    await frame2.click('[data-qa="reload-top"]');
    await waitFor(() => events.filter((e) => e.name === 'click').length > 1);

    const clickEvents = events.filter((e) => e.name === 'click');

    expect(clickEvents[1].frameSelector).toEqual(clickEvents[0].frameSelector);
    expect(clickEvents[1].selector).toEqual(clickEvents[0].selector);

    // the index must be different so that the code fetches the new frame
    expect(clickEvents[1].frameIndex).not.toEqual(clickEvents[0].frameIndex);

    await page.close();
  });

  it('collects paste', async () => {
    const page = await context.newPage();

    await page.goto(`${TEST_URL}text-inputs`);

    // tried a lot of ways to test this
    // sending Meta+V did not work
    // robotjs was not able to install for node v12
    // so we simulate a paste event instead
    await page.evaluate(() => {
      const event = new Event('paste') as any;
      event.clipboardData = { getData: (): string => 'secret' };
      const element = document.querySelector('[data-qa="html-text-input"]');
      if (element) element.dispatchEvent(event);
    });

    await page.close();

    expect(events[0].target.attrs['data-qa']).toEqual('html-text-input');
    expect((events[0] as PasteEvent).value).toEqual('secret');

    // make sure it collects the css selector
    expect(events[0].selector).toEqual('[data-qa="html-text-input"]');
  });

  it('collects scroll event', async () => {
    // only test this on chrome for now
    if (getLaunchOptions().browserName !== 'chromium') return;

    const page = await context.newPage();
    await page.goto(`${TEST_URL}large`);

    const session = await (context as ChromiumBrowserContext).newCDPSession(
      page,
    );

    // scroll a few times to make sure we capture it
    for (let i = 0; i < 3; i++) {
      // from https://github.com/puppeteer/puppeteer/issues/4119#issue-417279184
      await session.send('Input.dispatchMouseEvent', {
        type: 'mouseWheel',
        deltaX: 0,
        deltaY: 500,
        x: 0,
        y: 0,
      });

      // give time for scroll
      await sleep(1000);
    }

    const { isTrusted, name, target, value } = events[
      events.length - 1
    ] as ScrollEvent;

    expect(name).toEqual('scroll');
    expect(target.name).toEqual('html');
    expect(value.x).toEqual(0);

    // the page doesn't scroll perfectly so we can't check the exact y
    expect(value.y).toBeGreaterThan(200);
    expect(isTrusted).toEqual(true);

    await page.close();
  });

  it('collects input event for select', async () => {
    const page = await context.newPage();
    await page.goto(`${TEST_URL}selects`);

    await page.selectOption('[data-qa="html-select"]', 'hedgehog');
    await page.close();

    const { name, isTrusted, target, value } = events[
      events.length - 2
    ] as InputEvent;

    expect(isTrusted).toEqual(false);
    expect(name).toEqual('input');
    expect(target.attrs['data-qa']).toEqual('html-select');
    expect(value).toEqual('hedgehog');
  });

  it('collects type', async () => {
    const page = await context.newPage();
    await page.goto(`${TEST_URL}text-inputs`);

    await page.type('[data-qa="html-text-input"]', 'sup');
    await page.keyboard.press('Tab');
    await page.type('body', 'yo');

    await page.close();

    expect(events[0].target.attrs['data-qa']).toEqual('html-text-input');
    expect(
      (events.filter((e) => isKeyEvent(e)) as KeyEvent[]).map((e) => e.value),
    ).toEqual(['s', 's', 'u', 'u', 'p', 'p', 'Tab', 'Tab', 'y', 'y', 'o', 'o']);
  });

  it('collects back button press and new tab with typed address', async () => {
    // only test this on chrome for now
    if (getLaunchOptions().browserName !== 'chromium') return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.goto(`${TEST_URL}text-inputs`);
    await page.goBack();
    await page.close();

    expect(windowEvents.pop().name).toBe('goBack');
    expect(windowEvents.pop().name).toBe('goto');
  });

  it('collects a new typed address after back button press (rewritten browser history)', async () => {
    // only test this on chrome for now
    if (getLaunchOptions().browserName !== 'chromium') return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.goBack();
    await page.goto(`${TEST_URL}text-inputs`);
    await page.close();

    expect(windowEvents.pop().name).toBe('goto');
    expect(windowEvents.pop().name).toBe('goBack');
    expect(windowEvents.pop().name).toBe('goto');
  });

  it('collects reload button', async () => {
    // only test this on chrome for now
    if (getLaunchOptions().browserName !== 'chromium') return;

    const page = await context.newPage();

    await page.goto(TEST_URL);
    await page.reload();
    await page.close();

    expect(windowEvents.pop().name).toBe('reload');
  });
});
