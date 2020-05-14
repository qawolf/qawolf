---
id: table_of_contents
title: API Table of Contents
---

### [`qawolf@v1.0.1`](https://www.npmjs.com/package/qawolf/v/1.0.1)

<a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
<br/>
<br/>

In addition to the APIs below, you have full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md), the [Jest API](https://jestjs.io/docs/en/expect), and [expect-playwright API](https://github.com/playwright-community/expect-playwright#api-documentation).

The QA Wolf API is minimal by design, since we want to leverage the power of Playwright/Jest as much as possible.

## CLI

[npx qawolf --help](cli#npx-qawolf---help)

[npx qawolf create url [name]](cli#npx-qawolf-create-url-name)

[npx qawolf edit name](cli#npx-qawolf-edit-name)

[npx qawolf test [name]](cli#npx-qawolf-test-name)

[npx qawolf howl](cli#npx-qawolf-howl)

## Environment Variables

[QAW_ARTIFACT_PATH](environment_variables#qaw_artifact_path)

[QAW_BROWSER](environment_variables#qaw_browser)

## module: qawolf

[create](qawolf/create)

[launch](qawolf/launch)

[register](qawolf/register)

[repl](qawolf/repl)

[saveState](qawolf/save_state)

[scroll](qawolf/scroll)

[setState](qawolf/set_state)

[stopVideos](qawolf/stop_videos)

[waitForPage](qawolf/wait_for_page)
