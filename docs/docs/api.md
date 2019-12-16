---
id: api
title: API
---

### [qawolf@v0.7.4](https://www.npmjs.com/package/qawolf/v/0.7.4)

The generated code imports the `qawolf` node package, which extends the [Puppeteer API](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md) with [automatic waiting](how_it_works#-automatic-waiting) for elements and assertions, and [smart element selectors](how_it_works#-element-selectors).

##### Table of Contents

- [Environment Variables](#environment-variables)
  - [QAW_DATA_ATTRIBUTE](#qaw_data_attribute)
  - [QAW_DEBUG](#qaw_debug)
  - [QAW_TIMEOUT_MS](#qaw_timeout_ms)
  - [QAW_HEADLESS](#qaw_headless)
  - [QAW_KEY_DELAY_MS](#qaw_key_delay_ms)
  - [QAW_SLEEP_MS](#qaw_sleep_ms)
- [class: QAWolf](#class-qawolf)
  - [qawolf.launch([options])](#qawolflaunchoptions)
  - [qawolf.waitUntil(predicate[, timeoutMs])](#qawolfwaituntilpredicate-timeoutms-sleepms)
- [class: Browser](#class-browser)
  - [browser.click(selector[, options])](#browserclickselector-options)
  - [browser.close()](#browserclose)
  - [browser.find(selector[, options])](#browserfindselector-options)
  - [browser.findProperty(selector, property[, options])](#browserfindpropertyselector-property-options)
  - [browser.goto(url[, options])](#browsergotourl-options)
  - [browser.hasText(text[, options])](#browserhastexttext-options)
  - [browser.page([options])](#browserpageoptions)
  - [browser.scroll(selector, value[, options])](#browserscrollselector-value-options)
  - [browser.select(selector, value[, options])](#browserselectselector-value-options)
  - [browser.type(selector, value[, options])](#browsertypeselector-value-options)
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

### QAW_DATA_ATTRIBUTE

- default: `null`

When a recorded element selector has the `QAW_DATA_ATTRIBUTE`, it will only find an element with that same attribute value. If the recorded element does not have that attribute, it will use the default [selector logic](how_it_works#-element-selectors).

**Example**

Record a test with:

```bash
QAW_DATA_ATTRIBUTE=data-qa npx qawolf record www.myawesomesite.com myTest
```

Click on this element to create `selectors[0]`:

```html
<input data-qa="search" type="text" />
```

Run the test:

```bash
QAW_DATA_ATTRIBUTE=data-qa npx qawolf test myTest
```

This will only find an element with `data-qa=search` to click on:

```js
await browser.click(selectors[0]);
```

### QAW_DEBUG

- default: `false`

Prevent the browser from closing to help with debugging an error. Open the [Chrome DevTools Console](https://developers.google.com/web/tools/chrome-devtools/console) to see logs from QA Wolf. Run `qaw_find()` in the console to re-run the last find.

### QAW_TIMEOUT_MS

- default: `30000`

The default maximum time to wait for [FindElementOptions].

### QAW_HEADLESS

- default: `false`

Run the browser in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome).

### QAW_KEY_DELAY_MS

- default: `0`

Time to wait in milliseconds after typing a key.

### QAW_SLEEP_MS

- default: `1000`

The default time to sleep after an element is found for [FindElementOptions]. To run your tests as fast as possible, set `QAW_SLEEP_MS=0`.

We default to 1s to:

- make video replays easy to watch
- wait for elements that appear before their event handlers are attached or data is loaded. You can write custom wait logic instead, see the [`waitUntil` helper](api#waituntil).

## class: QAWolf

```js
const { browser, waitFor } = require("qawolf");
```

### qawolf.launch([options])

- `options` <[Object]>
  - `url` <[string]> The url to go to.
- returns: <[Promise]<[Browser]>>

Launch a [Browser](#class-browser):

```js
const browser = await launch({ url: "https://nytimes.com" });
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

## class: Browser

- extends: [puppeteer.Browser]

A [puppeteer.Browser] with actions and assertions to [find]() and [automatically wait]() for elements.

### browser.click(selector[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find and click an element. It will throw an error if the element is not found.

```js
const element = await browser.click(selectors[0]);

await browser.click({ css: "#my-id" });

await browser.click({ text: "Login" }, { sleepMs: 5000 });
```

### browser.close()

Close the browser and stop recording.

```js
await browser.close();
```

### browser.find(selector[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element. It will throw an error if the element is not found.

```js
const element = await browser.find(selectors[0]);
```

### browser.findProperty(selector, property[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `property` <[string]> the name of the property.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element's property. It will throw an error if the element is not found.

```js
const id = await browser.findProperty({ css: "select" }, "id");

const value = await browser.findProperty({ css: "#input-id" }, "value");
```

### browser.goto(url[, options])

- `url` <?[string]> URL to navigate page to. The url should include scheme, e.g. `https://`.
- `options` <[FindPageOptions] & [DirectNavigationOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[Page]>> Resolves the page.

```js
const page = await browser.goto("https://youtube.com", {
  page: 1,
  waitForRequests: false
});
```

### browser.hasText(text[, options])

- `text` <[string]> the text to find on the page.
- `options` <[FindPageOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[boolean]>>

```js
const isLoggedIn = await browser.hasText("Secure Area");
```

### browser.page([options])

- `options` <[FindPageOptions]> find the page with these options.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
  - `timeoutMs` <?[number]> maximum time to wait for a page to open. Defaults to `5000`.
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[Page]>> Resolves the page.

```js
const current = await browser.page();

const initial = await browser.page({ page: 0 });

const popup = await browser.page({ page: 1 });
```

### browser.scroll(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `value` <[Object]>
  - `x` <[number]> scroll the horizontal axis of the element by this pixel value.
  - `y` <[number]> scroll the vertical axis of the element by this pixel value.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find and scroll an element until `element.scrollLeft === value.x` and `element.scrollTop === value.y`.

It will throw an error if the element is not found or if it cannot scroll the element **at all**. It will **not** throw an error if it can scroll some, but not the whole amount.

```js
const element = await browser.scroll({ css: "body" }, { x: 0, y: 1000 });
```

### browser.select(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `value` <[string]> the value to select. To clear the select pass `null`.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Select the `value` from an element. It will throw an error if the element or value is not found.

```js
// select "Option 1"
await browser.select(selectors[0], "Option 1");

// clear the select
await browser.select(selectors[0], null);
```

### browser.type(selector, value[, options])

- `selector` <[Selector]> find an element that matches this selector. must specify `css`, `html`, or `text`.
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.
- `value` <[string]> type this value. To clear the element value pass `null`. You can also specify a sequence of keystrokes by prefixing the [key](https://github.com/puppeteer/puppeteer/blob/v2.0.0/lib/USKeyboardLayout.js) with the direction: [↓ keyboard.down](https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#keyboarddownkey-options), [↑ keyboard.up](https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#keyboardupkey-options), or [→ sendCharacter](https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#keyboardsendcharacterchar). This is useful for testing hotkeys.
- `options` <[FindElementOptions]> find the element with these options.
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.
- returns: <[Promise]<[ElementHandle]>> Resolves the element.

Find an element, focus it and type the value. It will wait [QAW_KEY_DELAY_MS](#qaw_key_delay_ms) (defaults to `0`) milliseconds in between key presses.

If `value` does not have special keys, it will clear `element.value` before typing. It will throw an error if the element is not found.

```js
await browser.type(selectors[0], "hello");

// type "嗨Sup!"
await browser.type(
  selectors[0],
  "→嗨↓Shift↓KeyS↑Shift↑KeyS↓KeyU↑KeyU↓KeyP↓Shift↑KeyP↓Digit1↑Digit1↑Shift"
);
```

## Interfaces

### interface: FindElementOptions

- extends: <[Object]>
  - `dataAttribute` <?[string]> prioritize this data attribute. Defaults to [QAW_DATA_ATTRIBUTE](#qaw_data_attribute).
  - `sleepMs` <?[number]> sleep after an element is found for this time in milliseconds. Defaults to [QAW_SLEEP_MS](#qaw_sleep_ms).
  - `timeoutMs` <?[number]> maximum time to wait for an element. Defaults to [QAW_TIMEOUT_MS](#qaw_timeout_ms).
  - `waitForRequests` <?[boolean]> wait until the page completes all network requests (limited to 10s per request). Defaults to `true`.

```js
await browser.click(selectors[0], {
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
await browser.goto("https://youtube.com", {
  page: 1,
  waitForRequests: false
});
```

### interface: Selector

- extends: <[Object]> must specify `css`, `html`, or `text`
  - `css` <?[CssSelector]> find the first visible element with `document.querySelector(css)`.
  - `html` <?[string]> find the closest match to this html element.
  - `text` <?[string]> find an element with this text.
  - `page` <?[number]> the index of the page to use in order of creation, starting with 0. defaults to the last used page.

```js
const selectors = [
  // find the element with id=open-login-window
  { css: "#open-login-window" },
  // find the element with text "email" on the second page that opened
  { text: "email", page: 1 }
];

await browser.click(selectors[0]);

await browser.type(selectors[1], "my@email.com");
```

[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[browser]: #class-browser "Browser"
[cssselector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors "CssSelector"
[directnavigationoptions]: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#pagegotourl-options "DirectNavigationOptions"
[elementhandle]: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#class-elementhandle "ElementHandle"
[findelementoptions]: #interface-findelementoptions "FindElementOptions"
[findpageoptions]: #interface-findpageoptions "FindPageOptions"
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "number"
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[page]: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#class-page "Page"
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[puppeteer.browser]: https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#class-browser "puppeteer.Browser"
[selector]: #interface-selector "Selector"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
