---
id: environment_variables
title: Environment Variables
---

Environment variables can be used when running [CLI commands](cli):

```bash
QAW_SLEEP_MS=0 npx qawolf test myTest
```

You can also [pass environment variables](../run_tests_in_ci#use-environment-variables) when running tests in CI:

```yaml
env:
  QAW_SLEEP_MS: 0
```

## QAW_ARTIFACT_PATH

**Default:** `null`

Specify the path where [debug artifacts](run_tests_in_ci#debug) should be saved. Debug artifacts include logs from the browser and the QA Wolf server. On Linux with [xvfb](https://zoomadmin.com/HowToInstall/UbuntuPackage/xvfb) installed, a video recording and corresponding GIF are also saved.

#### Examples

```bash
QAW_ARTIFACT_PATH=./artifacts npx qawolf test
```

## QAW_ATTRIBUTE

**Default:** `data-cy,data-qa,data-test,data-testid`

Specify `QAW_ATTRIBUTE` when you create a test, and QA Wolf will use that [attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) as a selector when it exists on an element.

You can specify multiple attributes separated by commas, for example: `QAW_ATTRIBUTE=aria-label,data-qa,id,title`.

When the element you interact with does not have the specified attribute, the generated code will use the [default selector logic](../use_custom_selectors#default-selector-logic).

#### Examples

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
await browser.click({ css: "[my-attribute='search']" });
```

## QAW_DEBUG

**Default:** `false`

Prevent the browser from closing to help with debugging.

Open the [Chrome DevTools console](https://developers.google.com/web/tools/chrome-devtools/console) to see logs from QA Wolf. Run `qawolf.find()` in the console to re-run the last call to [`find`](browser_context/find).

## QAW_DISABLE_VIDEO_ARTIFACT

**Default:** `false`

Disable capturing a video/GIF of the test.

If you are a Linux user, you should use this to to interact with the browser locally while still storing other [debug artifacts](../run_tests_in_ci#debug). The default behavior on Linux if [`QAW_ARTIFACT_PATH`](#qaw_artifact_path) is set is to run and record the browser on a virtual display.

#### Examples

For Linux users, to store other debug artifacts while running the test locally:

```bash
QAW_DISABLE_VIDEO_ARTIFACT=true QAW_ARTIFACT_PATH=./artifacts npx qawolf test myTestName

```

## QAW_HEADLESS

**Default:** `false`

Run the browser in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome). This will disable video recording in CI.

## QAW_SLEEP_MS

**Default:** `1000`

The time in milliseconds to sleep after an element is found before interacting with it. QA Wolf also waits for this amount of time before closing the browser.

To run your tests as fast as possible, use `QAW_SLEEP_MS=0`.

We use a default value of 1 second to:

- Make it easier to watch each step in the recorded video.
- Wait for elements that appear before their event handlers are attached or data is loaded. If your application has elements that appear before they can be interacted with, a best practice is to write custom wait logic to improve test stability.

## QAW_TIMEOUT_MS

**Default:** `30000`

The maximum time in milliseconds to wait for elements to appear before timing out.
