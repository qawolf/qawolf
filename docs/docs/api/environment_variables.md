---
id: environment_variables
title: Environment Variables
---

Environment variables can be used when running [CLI commands](cli):

```bash
QAW_ARTIFACT_PATH=/tmp/artifacts npx qawolf create www.myawesomesite.com
```

You can also [pass environment variables](../run_tests_in_ci#use-environment-variables) when running tests in CI:

```yaml
env:
  QAW_BROWSER: firefox
```

## QAW_ARTIFACT_PATH

**Default:** `null`

Save a video and console logs for each page in your test. Videos are saved at `${QAW_ARTIFACT_PATH}/video_${pageIndex}.mp4`, and console logs are saved at `${QAW_ARTIFACT_PATH}/logs_${pageIndex}.txt`. `pageIndex` corresponds to the index of the page starting at `0`.

Video is only supported on Chromium. We are [waiting for Playwright](https://github.com/microsoft/playwright/issues/1158) to add support for the Screencast API in Firefox and WebKit.

If [FFmpeg](https://www.ffmpeg.org) is not installed, videos will not be included. Install [`@ffmpeg-installer/ffmpeg`](https://www.npmjs.com/package/@ffmpeg-installer/ffmpeg) as a dependency or set the `FFMPEG_PATH` environment variable.

Note that your code must call [`qawolf.register`](qawolf/register) for artifacts to be saved.

#### Examples

```bash
QAW_ARTIFACT_PATH=/tmp/artifacts npx qawolf test
```

## QAW_BROWSER

**Default:** `chromium`

Which browser to run your tests on. Allowed values are `chromium`, `firefox`, and `webkit`. Setting `QAW_BROWSER` is equivalent to using a browser flag with the [`test` CLI command](cli#npx-qawolf-test-name).

To run on all browsers (Chromium, Firefox, and WebKit), use the `--all-browsers` flag with the [`test` CLI command](cli#npx-qawolf-test-name).
