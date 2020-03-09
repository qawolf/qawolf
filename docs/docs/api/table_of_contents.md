---
id: table_of_contents
title: API Table of Contents
---

### [`qawolf@v0.12.0`](https://www.npmjs.com/package/qawolf/v/0.9.3)

<a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
<br/>
<br/>

In addition to the APIs below, you have full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md) and the [Jest API](https://jestjs.io/docs/en/expect). The QA Wolf API is minimal by design, since we want to leverage the power of Playwright/Jest as much as possible.

## CLI

[npx qawolf --help](cli#npx-qawolf---help)

[npx qawolf create url [name]](cli#npx-qawolf-create-url-name)

[npx qawolf test [name]](cli#npx-qawolf-test-name)

[npx qawolf azure](cli#npx-qawolf-azure)

[npx qawolf bitbucket](cli#npx-qawolf-bitbucket)

[npx qawolf circleci](cli#npx-qawolf-circleci)

[npx qawolf github](cli#npx-qawolf-github)

[npx qawolf gitlab](cli#npx-qawolf-gitlab)

[npx qawolf howl](cli#npx-qawolf-howl)

[npx qawolf jenkins](cli#npx-qawolf-jenkins)

## Environment Variables

[QAW_ARTIFACT_PATH](environment_variables#qaw_artifact_path)

[QAW_ATTRIBUTE](environment_variables#qaw_attribute)

[QAW_BROWSER](environment_variables#qaw_browser)

[QAW_HEADLESS](environment_variables#qaw_headless)

## module: qawolf

[launch](qawolf/launch)

[repl](qawolf/repl)

## class: BrowserContext

[class: BrowserContext](browser_context/class_browser_context)

[click](browser_context/click)

[close](browser_context/close)

[find](browser_context/find)

[findProperty](browser_context/find_property)

[goto](browser_context/goto)

[hasText](browser_context/has_text)

[page](browser_context/page)

[scroll](browser_context/scroll)

[select](browser_context/select)

[type](browser_context/type)
