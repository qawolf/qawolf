---
id: environment_variables
title: Environment Variables
---

## QAW_ARTIFACT_PATH

Specify the path where [debug artifacts](run_tests_in_ci#debug) should be saved. Debug artifacts include logs from the browser and the QA Wolf server. On Linux with [xvfb](https://zoomadmin.com/HowToInstall/UbuntuPackage/xvfb) installed, a video recording and corresponding GIF are also saved.

**Default:** `null`

#### Examples

```bash
QAW_ARTIFACT_PATH=./artifacts npx qawolf test
```

## QAW_ATTRIBUTE

## QAW_SLEEP_MS

## QAW_TIMEOUT_MS
