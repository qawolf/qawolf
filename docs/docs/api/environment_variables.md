---
id: environment_variables
title: Environment Variables
---

Environment variables can be used when running [CLI commands](cli):

```bash
QAW_ATTRIBUTE=my-attribute npx qawolf create www.myawesomesite.com
```

You can also [pass environment variables](../run_tests_in_ci#use-environment-variables) when running tests in CI:

```yaml
env:
  QAW_BROWSER: firefox
```

## QAW_ARTIFACT_PATH

**Default:** `null`

Save a video and console logs for each page in your test or script. Videos are saved at `${QAW_ARTIFACT_PATH}/video_${pageIndex}.mp4`, and console logs are saved at `${QAW_ARTIFACT_PATH}/logs_${pageIndex}.txt`. `pageIndex` corresponds to the index of the page starting at `0`.

Video is only supported on Chromium. We are [waiting for Playwright](https://github.com/microsoft/playwright/issues/1158) to add support for the Screencast API in Firefox and WebKit.

If [FFmpeg](https://www.ffmpeg.org) is not installed, videos will not be included. Install [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) as a dependency or set the `FFMPEG_PATH` environment variable.

Note that your code must call [`qawolf.register`](qawolf/register) for artifacts to be saved.

#### Examples

```bash
QAW_ARTIFACT_PATH=./artifacts npx qawolf test
```

## QAW_ATTRIBUTE

**Default:** `data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/`

Specify `QAW_ATTRIBUTE` when you create a test, and QA Wolf will use that [attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors) as a selector when it exists on an element. You can specify an attribute directly, or use a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions). For example, the expression `/^qa-.*/` will match any attributes that start with `qa-` like `qa-submit`.

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

## QAW_BROWSER

**Default:** `chromium`

Which browser to run your tests or scripts on. Allowed values are `chromium`, `firefox`, and `webkit`. Setting `QAW_BROWSER` is equivalent to using a browser flag with the [`test` CLI command](cli#npx-qawolf-test-name).

To run on all browsers (Chromium, Firefox, and WebKit), use the `--all-browsers` flag with the [`test` CLI command](cli#npx-qawolf-test-name).

## QAW_HEADLESS

**Default:** `true`

Run the browser in [headless mode](https://developers.google.com/web/updates/2017/04/headless-chrome).
