---
id: create_a_script
title: 🤖 Create a Script
---

In addition to browser tests, you can also create browser scripts with QA Wolf.

## TL;DR

- [Create a browser script](#create-a-script) by running `npx qawolf create` with the `--script` flag:

```bash
npx qawolf create --script www.google.com myScriptName
```

- [Run a script](#run-a-script) using [Node.js](https://nodejs.dev/run-nodejs-scripts-from-the-command-line):

```bash
node ./qawolf/scripts/myScriptName.js
```

## Create a script

To create a browser script with QA Wolf, run the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name) with the `--script` flag in your project directory. Make sure you [have QA Wolf installed](install).

For example, the following will create a browser script on `www.google.com` with the name `myScriptName`:

```bash
npx qawolf create --script www.google.com myScriptName
```

A [Chromium](https://www.chromium.org/Home) browser will open to translate your actions to code.

## Review script code

As you use the browser, your script code will be saved at `.qawolf/scripts/myScriptName.js`. You can open this file and edit it as you go along.

A function with the specified name (`myScriptName` in our example) will be created for you. This function takes a [Playwright `BrowserContext`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext) instance and completes the steps in your workflow.

Below is an example script file:

```js
const qawolf = require('qawolf');
const selectors = require('../selectors/myScriptName.json');

const myScriptName = async context => {
  let page = await context.newPage();
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create script!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  await page.click(selectors['4_button']);
};

exports.myScriptName = myScriptName;

if (require.main === module) {
  (async () => {
    const browser = await qawolf.launch();
    const context = await browser.newContext();
    await qawolf.register(context);
    await myScriptName(context);
    await qawolf.stopVideos();
    await browser.close();
  })();
}
```

## Save a script

When you are done creating your script, return to the command line and choose the `💾 Save and Exit` option.

## Run a script

You can run your script [from the command line using Node.js](https://nodejs.dev/run-nodejs-scripts-from-the-command-line). For example:

```bash
node ./qawolf/scripts/myScriptName.js
```
