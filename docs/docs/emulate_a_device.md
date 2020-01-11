---
id: emulate_a_device
title: 📱 Emulate a Device
---

When you create a test with QA Wolf, by default it runs on a browser that is 1366 pixels wide and 768 pixels tall. These dimensions are the default because they are the [most common desktop screen resolution](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide).

In this tutorial, we'll learn how to emulate [devices](https://github.com/puppeteer/puppeteer/blob/v2.0.0/lib/DeviceDescriptors.js) and test responsive layouts. We assume you know how to [create a test](create_a_test) and have a [basic understanding of the test code](review_test_code).

## Create a test that emulates a device

When you use the [`npx qawolf create <url> [name]` command](cli#npx-qawolf-create-url-name), you can optionally specify a device with the `--device` flag. The `--device` flag is a [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) that specifies one of [Puppeteer's supported devices](https://github.com/puppeteer/puppeteer/blob/master/lib/DeviceDescriptors.js). If you do so, QA Wolf will use [Puppeteer's device emulator](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerdevices) when creating your test.

For example, we can run the following command with the `--device` flag set to `"iPad Mini"`:

```bash
npx qawolf create --device="iPad Mini" https://www.wikipedia.org searchTablet
```

When the [Chromium](https://www.chromium.org/Home) browser opens, it will be emulating an [iPad Mini](https://www.apple.com/ipad-mini/). The GIF below provides an example.

![Create a test with device flag](https://storage.googleapis.com/docs.qawolf.com/tutorials/create-test-device-small.gif)

If we look at the test code (in the file `.qawolf/tests/searchTablet.test.js` in our example), the beginning will look like this:

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

You'll notice that the `device` key with the value `"iPad Mini"` was included in the options to the [`launch` method](api#qawolflaunchoptions). This means that when you run your test, the [`browser`](api#class-browser) will emulate the iPad Mini.

If `device` is not specified when calling [`launch`](api#qawolflaunchoptions), it will default to [`"desktop"`](https://github.com/qawolf/qawolf/blob/3256831cd93c172e81c9f7eb1fdeb347733d72ec/packages/browser/src/browser/device.ts#L9-L24) (1366x768 pixels).

## Update an existing test

You can also edit an existing test to use a different device, including custom devices. To do this, update the options passed to the [`launch` method](api#qawolflaunchoptions) in the [Jest `beforeAll` block](https://jestjs.io/docs/en/api#beforeallfn-timeout).

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

We can pass the `device` key in addition to the `url` key when calling [`launch`](api#qawolflaunchoptions). The value of the `device` key can be either a [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) or a device [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) (more on this shortly).

In the example below we set `device` to `"iPhone 7"`, one of [Puppeteer's supported devices](https://github.com/puppeteer/puppeteer/blob/master/lib/DeviceDescriptors.js).

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

You can also specify a custom device [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). This allows you to target exact screen dimensions.

See [Puppeteer source code](https://github.com/puppeteer/puppeteer/blob/master/lib/DeviceDescriptors.js) for example device specifications. You can also see [QA Wolf source code](https://github.com/qawolf/qawolf/blob/3256831cd93c172e81c9f7eb1fdeb347733d72ec/packages/browser/src/browser/device.ts#L9-L24) to see how it implements the default `"desktop"` device.

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

Now you can test your application across devices! 🎉
