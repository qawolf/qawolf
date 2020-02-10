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

Below is an example script file:

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/myScriptName");

const myScriptName = async () => {
  const browser = await launch({ url: "http://todomvc.com/examples/react" });
  // type into "What needs to be done?" input
  await browser.type(selectors[0], "create script!");
  // Enter
  await browser.type(selectors[1], "↓Enter↑Enter");
  // click input
  await browser.click(selectors[2]);
  // click "Clear completed" button
  await browser.click(selectors[3]);
  await browser.close();
};

myScriptName();
```

## Save a script

When you are done creating your script, return to the command line and choose the `💾 Save and Exit` option.

## Run a script

You can run your script [from the command line using Node.js](https://nodejs.dev/run-nodejs-scripts-from-the-command-line). For example:

```bash
node ./qawolf/scripts/myScriptName.js
```
