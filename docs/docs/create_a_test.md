---
id: create_a_test
title: 🎨 Create a Test
---

The [previous guide](install) showed you how to set up your environment and install QA Wolf. Now let's create your first browser test!

## TL;DR

- [Create a test](#create-a-test) by running the following in your project directory:

```bash
npx qawolf create https://myawesomesite.com myTestName
```

- [Review and edit test code](#review-test-code) as you go along by opening your test file (`.qawolf/tests/myTestName.test.js`)
- [Save your test](#save-a-test) by choosing `💾 Save and Exit` in the command line

## Create a test

First make sure that you are in your project directory and that you have [installed QA Wolf](install):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

Soon you'll run the command to create a test. When you run this command, a [Chromium](https://www.chromium.org/Home) browser will open and capture your actions such as clicking and typing into inputs. These actions will be converted to [Playwright](https://github.com/microsoft/playwright) and [Jest](https://jestjs.io/) test code.

In this guide, we create a test for [TodoMVC](http://todomvc.com/examples/react), a simple todo application. You can follow along using your own application if you prefer.

To create your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), and `myFirstTest` with a different test name. See our [CLI documentation](api/cli#npx-qawolf-create-url-name) for more details.

```bash
npx qawolf create http://todomvc.com/examples/react myFirstTest
```

A Chromium browser will open and navigate to the specified URL. Now go through the steps you want to test. In our example, we 1) create a todo item, 2) complete it, and 3) clear completed todos. See the video below for an example:

TODOUPDATEVIDEO

<video controls title="create your first test" width="100%">
  <source
    src="https://storage.googleapis.com/docs.qawolf.com/guides/create_test.mp4"
    type="video/mp4"
  />
</video>

We could return to the command line and choose the `💾 Save and Exit` option to save our test. However, let's first take a look at our test code.

## Review test code

If you open your project in your code editor, you'll notice that a folder called `.qawolf` was created. This folder stores your QA Wolf tests and has the following structure:

```bash
.qawolf # project directory
├── tests
│   └── myFirstTest.test.js
├── selectors
│   └── myFirstTest.json
```

Let's open the `.qawolf/tests/myFirstTest.test.js` file, which contains your test code. We'll explain the `.qawolf/selectors/myFirstTest.json` file a bit later.

Our code first requires the `qawolf` library, which is built on top of [Microsoft's Playwright](https://github.com/microsoft/playwright) library. It also requires the selectors file, which we'll get to later:

```js
const qawolf = require('qawolf');
const selectors = require('../selectors/myFirstTest.json');
```

To start your test, a few things happen in the [Jest `beforeAll` block](https://jestjs.io/docs/en/api#beforeallfn-timeout). The test launches a [browser](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browser) and creates a new [context](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext), which is an "incognito" browser session. This context is passed to the [`qawolf.register` method](api/qawolf/register) so QA Wolf can access it. Finally, a new [page](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page) is created:

```js
let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});
```

The test itself is contained in a [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout) with the name you specified (`"myFirstTest"` in our example). The test first navigates to the specified URL. Then it repeats the actions that you took:

TODOUPDATE

```js
test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors[0]);
});
```

After the test finishes running, the browser is closed in the [Jest `afterAll` block](https://jestjs.io/docs/en/api#afterallfn-timeout):

```js
afterAll(() => browser.close());
```

Putting it all together, below we show the full test code:

TODOUPDATE

```js
const { launch } = require('qawolf');
const selectors = require('../selectors/myFirstTest');

describe('myFirstTest', () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: 'http://todomvc.com/examples/react' });
  });

  afterAll(() => browser.close());

  it('can type into "What needs to be done?" input', async () => {
    await browser.type(selectors[0], 'create test!');
  });

  it('can Enter', async () => {
    await browser.type(selectors[1], '↓Enter↑Enter');
  });

  it('can click input', async () => {
    await browser.click(selectors[2]);
  });

  it('can click "Clear completed" button', async () => {
    await browser.click(selectors[3]);
  });

  // 🐺 CREATE CODE HERE
});
```

The line `// 🐺 CREATE CODE HERE` at the end of your test is a placeholder for where new test code will be added if you continue to use the browser. This allows you to optionally edit your test code as you go along. When you finish creating a test, this line is removed.

The video below shows how your test code is updated as you use your application:

TODOUPDATEVIDEO

<video controls title="test code generation" width="100%">
  <source
    src="https://storage.googleapis.com/docs.qawolf.com/guides/create.mp4"
    type="video/mp4"
  />
</video>

Let's now briefly touch upon the `.qawolf/selectors/myFirstTest.json` file. In general, you should avoid editing this file. For a more detailed explanation, see our guide on the [QA Wolf selector logic](use_custom_selectors#default-selector-logic).

The `.qawolf/selectors/myFirstTest.json` file contains information about each element that you interacted with (such as clicked or typed into). By default, QA Wolf stores all the [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes) of each element and its two direct ancestors. By using all the information it can to find an element, QA Wolf helps make your test code robust to changes in your application.

You can also [specify an attribute](use_custom_selectors#target-attributes) like `data-qa` for QA Wolf to use in your test code whenever possible.

## Save a test

Now let's return to the command line. You'll notice a few options here:

- `💾 Save and Exit`: saves your test code and closes the browser
- `🖥️ Open REPL to run code`: opens the [QA Wolf interactive REPL](use_the_repl) so you can try out code
- `🗑️ Discard and Exit`: closes the browser without saving your test code

Use the up and down arrow keys to choose between options. The default is `💾 Save and Exit`. Highlight this option and press `Enter` to save your test.

## Next steps

Congratulations - you just created your first test with QA Wolf! 🎉

Now let's [run our test locally](run_tests_locally).
