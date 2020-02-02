---
id: api
title: API
---

### [`qawolf@v0.8.3`](https://www.npmjs.com/package/qawolf/v/0.8.3)

<a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
<br/>

The generated code imports the `qawolf` node package, which extends the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md) with [automatic waiting](review_test_code#automatic-waiting) for elements and assertions, and [smart element selectors](review_test_code#element-selectors).

##### Table of Contents

- [Environment Variables](#environment-variables)
  - [QAW_ARTIFACT_PATH](#qaw_artifact_path)
  - [QAW_ATTRIBUTE](#qaw_attribute)
  - [QAW_DEBUG](#qaw_debug)
  - [QAW_DISABLE_VIDEO_ARTIFACT](#qaw_disable_video_artifact)
  - [QAW_HEADLESS](#qaw_headless)
  - [QAW_SLEEP_MS](#qaw_sleep_ms)
  - [QAW_TIMEOUT_MS](#qaw_timeout_ms)
- [class: QAWolf](#class-qawolf)
  - [qawolf.connect([options])](#qawolfconnectoptions)
  - [qawolf.launch([options])](#qawolflaunchoptions)
  - [qawolf.waitUntil(predicate[, timeoutMs])](#qawolfwaituntilpredicate-timeoutms-sleepms)
- [class: BrowserContext](#class-browsercontext)
  - [context.click(selector[, options])](#contextclickselector-options)
  - [context.close()](#contextclose)
  - [context.find(selector[, options])](#contextfindselector-options)
  - [context.findProperty(selector, property[, options])](#contextfindpropertyselector-property-options)
  - [context.goto(url[, options])](#contextgotourl-options)
  - [context.hasText(text[, options])](#contexthastexttext-options)
  - [context.page([options])](#contextpageoptions)
  - [context.scroll(selector, value[, options])](#contextscrollselector-value-options)
  - [context.select(selector, value[, options])](#contextselectselector-value-options)
  - [context.type(selector, value[, options])](#contexttypeselector-value-options)
- [Interfaces](#interfaces)
  - [FindElementOptions](#interface-findelementoptions)
  - [FindPageOptions](#interface-findpageoptions)
  - [Selector](#interface-selector)

## Environment Variables

Use environment variables for [CLI commands](cli):

```bash
QAW_SLEEP_MS=0 npx qawolf test myTest
```

Use environment variables in scripts:

```bash
QAW_SLEEP_MS=0 node .qawolf/scripts/myScript.js
```

Use [environment variables in CI](set_up_ci#environment-variables):

```yaml
env:
  QAW_SLEEP_MS: 0
```

### QAW_ARTIFACT_PATH

- default: `null`

Specify `QAW_ARTIFACT_PATH` to save artifacts to that path. This includes logs and a dom recording with [rrweb](https://www.rrweb.io) per test. On linux with [xvfb](https://zoomadmin.com/HowToInstall/UbuntuPackage/xvfb) installed, a video and gif are saved too.

```bash
QAW_ARTIFACT_PATH=./artifacts npx qawolf test
```

### QAW_ATTRIBUTE

- default: `data-cy,data-qa,data-test,data-testid`

Specify `QAW_ATTRIBUTE` when you create a test, and QA Wolf will use that [attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) as a selector when it exists on an element.

You can specify multiple attributes separated by commas, for example `QAW_ATTRIBUTE=aria-label,data-qa,id,title`.

When the element you interact with does not have the specified attribute, it will use the default [selector logic](review_test_code#element-selectors).

**Example**

Create a test with:

```bash
QAW_ATTRIBUTE=my-attribute npx qawolf create www.myawesomesite.com myTest
```

Click on this element:

```html
<button my-attribute="search">Search</button>
```

The generated code will be:

```js
await context.click({ css: "[my-attribute='search']" });
```

### QAW_DEBUG

- default: `false`

Prevent the browser from closing to help with debugging an error. Open the [Chrome DevTools Console](https://developers.google.com/web/tools/chrome-devtools/console) to see logs from QA Wolf. Run `qaw_find()` in the console to re-run the last find.

### QAW_DISABLE_VIDEO_ARTIFACT

- default: `false`

Disable capturing a video / gif of the test. This is useful if you are a linux user and you want to interact with the browser locally and store other artifacts (logs, etc). If you are on linux and set QAW_ARTIFACT_PATH but do not disable the video artifact, it will put the browser on a virtual display to capture it so you will not be able to interact with it.

### QAW_HEADLESS

- default: `false`

Run the browser in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome). This will disable video recording in CI.

### QAW_SLEEP_MS

- default: `1000`

The default time to sleep after an element is found for [FindElementOptions], and before closing the browser. To run your tests as fast as possible, set `QAW_SLEEP_MS=0`.

We default to 1s to:

- make it easier to watch each step in the video
- wait for elements that appear before their event handlers are attached or data is loaded. If your application has elements that appear before they can be acted upon, a best practice is to [write custom wait logic](api#waituntil) to improve test stability.

### QAW_TIMEOUT_MS

- default: `30000`

The default maximum time to wait for [FindElementOptions].

## class: QAWolf

```js
const { waitFor } = require("qawolf");
```

### qawolf.connect(options)

- `options` <[Object] & [playwright.ConnectOptions]>
  - `device` <?[device] | ?[string]> Emulate this [device]. If you pass a string it will lookup a device with that key in `playwright.devices[options.device]`. Defaults to "desktop" (1366x768).
  - `navigationTimeoutMs` <?[number]> Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.
  - `url` <[string]> The url to go to.
- returns: <[Promise]<[BrowserContext]>>

Connect to a [playwright.Browser] and creates a [BrowserContext](#class-browsercontext):

```js
const playwright = require("playwright");
const { connect } = require("qawolf");

const browserApp = await playwright.chromium.launchBrowserApp({
  webSocket: true
});
const connectOptions = browserApp.connectOptions();
const context = await connect(connectOptions);
```

### qawolf.launch(options)

- `options` <[Object] & [playwright.LaunchOptions]>
  - `device` <?[device] | ?[string]> Emulate this [device]. If you pass a string it will lookup a device with that key in `playwright.devices[options.device]`. Defaults to "desktop" (1366x768).
  - `navigationTimeoutMs` <?[number]> Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.
  - `url` <[string]> The url to go to.
- returns: <[Promise]<[BrowserContext]>>

Launch a [BrowserContext](#class-browsercontext):

```js
const { launch } = require("qawolf");

const context = await launch({
  device: "iPhone 7",
  devtools: true,
  navigationTimeoutMs: 120000,
  url: "https://nytimes.com"
});

const context = await launch({
  device: {
    name: "My Custom Device",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
    viewport: {
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      isLandscape: false
    }
  },
  url: "https://www.wikipedia.org/"
});
```

### qawolf.waitUntil(predicate, timeoutMs[, sleepMs])

- `predicate` <[function]:[boolean]> A function called until it returns truthy.
- `timeoutMs` <[number]> Maximum wait time in milliseconds.
- `sleepMs` <[number]> How often to check the predicate in milliseconds. Defaults to 500.
- returns: <[Promise]> Resolves when the predicate returns true.

It will throw an error if the timeout is reached.

```js
await waitUntil(async () => {
  const title = await page.title();
  return page.title === "My Awesome Title";
}, 15000);
```

## class: BrowserContext

- extends: [playwright.BrowserContext]

A [playwright.BrowserContext] with actions and assertions to [find](review_test_code#element-selectors) and [automatically wait for](review_test_code#automatic-waiting) elements.

### context.click(selector[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `options` <[FindElementOptions] & ClickOptions> find the element with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `simulate` <?[boolean]> simulate the click by dispatching a [MouseEvent]. Defaults to `true`, set to `false` to use [Page.click].
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find and click an element. It will throw an error if the element is not found.

```js
const element = await context.click(selectors[0]);

await context.click({ css: "#my-id" }, { simulate: false });

await context.click({ text: "Login" }, { sleepMs: 5000 });
```

### context.close()

Close the context and stop recording.

```js
await context.close();
```

### context.find(selector[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `options` <[FindElementOptions]> find the element with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element. It will throw an error if the element is not found.

```js
const element = await context.find(selectors[0]);
```

### context.findProperty(selector, property[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `property` <[string]> the name of the property.
- `options` <[FindElementOptions]> find the element with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element's property. It will throw an error if the element is not found.

```js
const id = await context.findProperty({ css: "select" }, "id");

const value = await context.findProperty({ css: "#input-id" }, "value");
```

### context.goto(url[, options])

- `url` <?[string]> URL to navigate page to. The url should include scheme, e.g. `https://`.
- `options` <[FindPageOptions] & [DirectNavigationOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[Page]>> Resolves the page.

```js
const page = await context.goto("https://youtube.com", {
  page: 1,
  waitForRequests: false
});
```

### context.hasText(text[, options])

- `text` <[string]> the text to find on the page.
- `options` <[FindPageOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for text to appear. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[boolean]>>

```js
const isLoggedIn = await context.hasText("Secure Area");
```

### context.page([options])

- `options` <[FindPageOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[Page]>> Resolves the page.

```js
const current = await context.page();

const initial = await context.page({ page: 0 });

const popup = await context.page({ page: 1 });
```

### context.scroll(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `value` <[Object]>
  - `x` <[number]> scroll the horizontal axis of the element by this pixel value.
  - `y` <[number]> scroll the vertical axis of the element by this pixel value.
- `options` <[FindElementOptions]> find the element with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find and scroll an element until `element.scrollLeft === value.x` and `element.scrollTop === value.y`.

It will throw an error if the element is not found or if it cannot scroll the element **at all**. It will **not** throw an error if it can scroll some, but not the whole amount.

```js
const element = await context.scroll({ css: "body" }, { x: 0, y: 1000 });
```

### context.select(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `value` <[string]> the value to select. To clear the select pass `null`.
- `options` <[FindElementOptions]> find the element with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Select the `value` from an element. It will throw an error if the element or value is not found.

```js
// select "Option 1"
await context.select(selectors[0], "Option 1");

// clear the select
await context.select(selectors[0], null);
```

### context.type(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
- `value` <[string]> type this value. To clear the element value pass `null`. You can also specify a sequence of keystrokes by prefixing the [keyboard.key] with the direction: ↓[keyboard.down], ↑[keyboard.up], or →[sendCharacter]. This is useful for testing hotkeys.
- `options` <[FindElementOptions] & TypeOptions> find the element with these options.
  - `delayMs` <?[number]> time to wait between key presses in milliseconds. Defaults to 300ms for ↓[keyboard.down] and ↑[keyboard.up]. Defaults to 0ms for →[sendCharacter].
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `skipClear` <?[boolean]> do not clear the element. Defaults to `false`.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element, focus it and type the value.

It will clear the element before typing if `value` does not start with `Enter` or `Tab` keys and `skipClear` is not specified. It will throw an error if the element is not found.

```js
await context.type(selectors[0], "hello");

// type "嗨Sup!"
await context.type(
  selectors[0],
  "→嗨↓Shift↓KeyS↑Shift↑KeyS↓KeyU↑KeyU↓KeyP↓Shift↑KeyP↓Digit1↑Digit1↑Shift"
);
```

## Interfaces

### interface: FindElementOptions

- extends: <[Object]>
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element and page. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.

```js
await context.click(selectors[0], {
  // click an element on the second page that opened
  page: 1,
  sleepMs: 5000,
  waitForRequests: false
});
```

### interface: FindPageOptions

- extends: <[Object]>
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.

```js
await context.goto("https://youtube.com", {
  page: 1,
  waitForRequests: false
});
```

### interface: Selector

- extends: <[Object]> must specify `css`, `html`, or `text`
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.

```js
const selectors = [
  // find the element with id=open-login-window
  { css: "#open-login-window" },
  // find the element with text "email"
  { text: "email" }
];

await context.click(selectors[0]);

await context.type(selectors[1], "my@email.com");
```

[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[browsercontext]: #class-browsercontext "BrowserContext"
[cssselector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors "CssSelector"
[device]: https://github.com/microsoft/playwright/blob/master/docs/api.md#playwrightdevices "device"
[directnavigationoptions]: https://github.com/microsoft/playwright/blob/master/docs/api.md#pagegotourl-options "DirectNavigationOptions"
[elementhandle]: https://github.com/microsoft/playwright/blob/master/docs/api.md#class-elementhandle "ElementHandle"
[findelementoptions]: #interface-findelementoptions "FindElementOptions"
[findpageoptions]: #interface-findpageoptions "FindPageOptions"
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[htmlelement.click()]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click "HTMLElement.click"
[keyboard.key]: https://github.com/microsoft/playwright/blob/master/src/usKeyboardLayout.ts "keyboard.key"
[keyboard.down]: https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboarddownkey-options "keyboard.down"
[keyboard.up]: https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardupkey "keyboard.up"
[mouseevent]: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent "MouseEvent"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "number"
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[page]: https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page "Page"
[page.click]: https://github.com/microsoft/playwright/blob/master/docs/api.md#pageclickselector-options "Page.click"
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[playwright.browser]: https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browser "playwright.Browser"
[playwright.browsercontext]: https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext "playwright.BrowserContext"
[playwright.launchoptions]: https://github.com/microsoft/playwright/blob/master/docs/api.md#playwrightlaunchoptions "playwright.LaunchOptions"
[selector]: #interface-selector "Selector"
[sendcharacter]: https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardsendcharacterchar" "sendCharacter"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
