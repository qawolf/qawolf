---
id: emulate_a_device
title: 📱 Emulate a Device
---

When you create a test with QA Wolf, by default it runs on a browser that is 1366 pixels wide and 768 pixels tall. These dimensions are the default because they are the [most common desktop screen resolution](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide).

In this guide, we explain how to emulate [devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) and test responsive layouts. We assume you know how to [create a test](create_a_test).

## TL;DR

- Use the `--device` flag to [create a test that emulates a device](#create-a-test-that-emulates-a-device):

```bash
npx qawolf create --device="iPad Mini" https://www.wikipedia.org searchTablet
```

- [Update an existing test](#update-an-existing-test) to emulate a device:

```js
describe("search", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({
      // custom code starts
      device: "iPhone 7",
      // custom code ends
      url: "https://www.wikipedia.org/"
    });
  });
});
```

## Create a test that emulates a device

When you [create a test](create_a_test) ([`npx qawolf create <url> [name]`](api/cli#npx-qawolf-create-url-name)), you can optionally specify a device with the `--device` flag. The `--device` flag is a [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) that specifies one of [Playwright's supported devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts). If you do so, QA Wolf will use [Playwright's device emulator](https://github.com/microsoft/playwright/blob/master/docs/api.md#playwrightdevices) when creating your test.

For example, you can run the following command with the `--device` flag set to `"iPad Mini"`:

```bash
npx qawolf create --device="iPad Mini" https://www.wikipedia.org searchTablet
```

When the [Chromium](https://www.chromium.org/Home) browser opens, it will be emulating an [iPad Mini](https://www.apple.com/ipad-mini/).

If we look at the test code (`.qawolf/tests/searchTablet.test.js` in our example), the beginning will look like this:

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/searchTablet");

describe("searchTablet", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({
      device: "iPad Mini",
      url: "https://www.wikipedia.org/"
    });
  });

  // ...
});
```

You'll notice that `device` was set to `"iPad Mini"` in the options passed to the [`launch` method](api/qawolf/launch). This means that when you run your test, the `browser` will emulate the iPad Mini.

If `device` is not specified when calling [`launch`](api/qawolf/launch), it will default to [`"desktop"`](https://github.com/qawolf/qawolf/blob/3256831cd93c172e81c9f7eb1fdeb347733d72ec/packages/browser/src/browser/device.ts#L9-L24) (1366x768 pixels).

## Update an existing test

You can also edit an existing test to use a different device, including custom devices. To do this, update the options passed to the [`launch` method](api/qawolf/launch) in the [Jest `beforeAll` block](https://jestjs.io/docs/en/api#beforeallfn-timeout).

For example, let's say we have a test that looks like this:

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/search");

describe("search", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({
      url: "https://www.wikipedia.org/"
    });
  });

  // ...
});
```

We can pass the `device` key in addition to the `url` key when calling [`launch`](api/qawolf/launch). The value of the `device` key can be either a [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) or a custom device [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) (more on this shortly).

In the example below we set `device` to `"iPhone 7"`, one of [Playwright's supported devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts):

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/search");

describe("search", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({
      // custom code starts
      device: "iPhone 7",
      // custom code ends
      url: "https://www.wikipedia.org/"
    });
  });

  // ...
});
```

You can also specify a custom device [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). This allows you to target exact screen dimensions:

```js
describe("search", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({
      // custom code starts
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
      // custom code ends
      url: "https://www.wikipedia.org/"
    });
  });

  // ...
});
```

See the [Playwright source code](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) for example device specifications. You can also see the [QA Wolf source code](https://github.com/qawolf/qawolf/blob/3256831cd93c172e81c9f7eb1fdeb347733d72ec/packages/browser/src/browser/device.ts#L9-L24) for the implementation of the default `"desktop"` device.

## Next steps

Now you can test your application across devices! 🎉

There are a few places you might want to go from here:

- [Add assertions](add_assertions) to your tests
- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
