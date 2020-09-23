---
id: emulate_a_device
title: 📱 Emulate a Device
---

In this guide, we explain how to emulate [devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) and test responsive layouts. We assume you know how to [create a test](create_a_test).

## TL;DR

- Use the `--device` flag to [create a test that emulates a device](#create-a-test-that-emulates-a-device):

```bash
npx qawolf create --device="iPad Mini" https://www.wikipedia.org searchTablet
```

- [Update an existing test](#update-an-existing-test) to emulate a device:

```js
const { devices } = require('playwright');
const qawolf = require('qawolf');
const device = devices['iPhone 7'];

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport,
  });
  await qawolf.register(context);
});

// ...
```

## Create a test that emulates a device

When you [create a test](create_a_test) ([`npx qawolf create <url> [name]`](api/cli#npx-qawolf-create-url-name)), you can optionally specify a device with the `--device` flag. The `--device` flag is a [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) that specifies one of [Playwright's supported devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts). If you do so, QA Wolf will use [Playwright's device emulator](https://github.com/microsoft/playwright/blob/master/docs/api.md#playwrightdevices) when creating your test.

For example, you can run the following command where the `--device` flag is set to `"iPad Mini"`:

```bash
npx qawolf create --device="iPad Mini" https://www.wikipedia.org searchTablet
```

:::caution

If you are using [Windows PowerShell](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/powershell), wrap the name of the device in additional quotes as shown below:

```bash
npx qawolf create --device='""iPad Mini""' https://www.wikipedia.org searchTablet
```

:::

When the [Chromium](https://www.chromium.org/Home) browser opens, it will be emulating an [iPad Mini](https://www.apple.com/ipad-mini/).

The beginning of our test code (`.qawolf/searchTablet.test.js` in our example) looks like this:

```js
const { devices } = require('playwright');
const qawolf = require('qawolf');
const device = devices['iPad Mini'];

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport,
  });
  await qawolf.register(context);
  page = await context.newPage();
});

// ...
```

You'll notice that `userAgent` and `viewport` were set to the values specified in `devices["iPad Mini"]`. These values are used in the [`browser.newContext` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions) so your test will emulate the iPad Mini.

If `device` is not specified when calling [`browser.newContext`](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions), it will use Playwright's default device.

## Update an existing test

You can also edit an existing test to use a different device, including custom devices. To do this, update the options passed to the [`browser.newContext` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions) in the [Jest `beforeAll` block](https://jestjs.io/docs/en/api#beforeallfn-timeout).

For example, let's say we have a test that looks like this:

```js
const qawolf = require('qawolf');

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext();
  await qawolf.register(context);
});

  // ...
});
```

We can pass the `userAgent` and `viewport` keys when calling [`browser.newContext`](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions). The value of these keys must match Playwright's device configuration.

In the example below we set `userAgent` to `devices["iPhone 7"].userAgent` and `viewport` to `devices["iPhone 7"].viewport`. We import `devices` from Playwright at the top of the file. See the list of [Playwright supported devices](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) to see all devices:

```js
const { devices } = require('playwright');
const qawolf = require('qawolf');
const device = devices['iPhone 7'];

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext({
    userAgent: device.userAgent,
    viewport: device.viewport,
  });
  await qawolf.register(context);
});

// ...
```

You can also specify a custom values for `userAgent` and `viewport`. This allows you to target exact screen dimensions:

```js
const qawolf = require('qawolf');

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.1.0; en-US) AppleWebKit/536.2+ (KHTML like Gecko) Version/7.2.1.0 Safari/536.2+',
    viewport: {
      width: 600,
      height: 1024,
      deviceScaleFactor: 1,
      isMobile: true,
    },
  });
  await qawolf.register(context);
});

// ...
```

See the [Playwright source code](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) for example device specifications.

## Next steps

Now you can test your application across devices! 🎉

There are a few places you might want to go from here:

- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
