---
id: smoke_tests_with_alerts
title: 🔥 Smoke Tests with Alerts
---

You may have experienced this: someone pushed code to production and now a critical user workflow is broken. Despite your team’s best efforts, the bug slipped through. How could you have caught it before a user did? 😱

In this tutorial, we’ll learn about smoke testing as a line of defense against bugs on production. We’ll set up smoke tests on a website, and build an alerting system that tells us when something isn’t working. Let’s get started!

## What are smoke tests?

Smoke tests are tests that cover the most important functionality of an application. For example, on Netflix the critical user workflows include signing in, searching for a show, and watching a show. The term “smoke test” originated in hardware repair, where a machine would fail the smoke test if it caught on fire when turned on. 🔥

[According to Microsoft](<https://docs.microsoft.com/en-us/previous-versions/ms182613(v=vs.80)?redirectedfrom=MSDN>), “smoke testing is the most cost-effective method for identifying and fixing defects in software” after code reviews. This is because smoke tests are **not** intended to cover every permutation and edge case. Instead, smoke tests verify that the critical functionality isn't broken to the point where further testing would be unnecessary.

The book [<i>Lessons Learned in Software Testing</i>](https://www.oreilly.com/library/view/lessons-learned-in/9780471081128/) summarizes it well: "smoke tests broadly cover product features in a limited time...if key features don't work or if key bugs haven't yet been fixed, your team won't waste further time installing or testing."

## Get started

Let’s set up our project for our first smoke test! First, make sure that you have [Node.js installed](https://nodejs.org/en/download/). To get started, either create a new [Node.js](ttps://nodejs.org) project, or change directories into an existing one.

To create a new project, run the following in the command line:

```bash
mkdir smoke-tests
cd smoke-tests
npm init -y
```

You can follow along in this example GitHub repository. [Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/ee0d7d51265215ae9abe9a1579c7da99a414f78b)

Now we need to install the `qawolf` [npm package](https://www.npmjs.com/package/qawolf). `qawolf` is an open source Node.js library that generates [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code from your browser interactions. It also allows you to quickly [set up running your tests on a schedule in various CI providers](set_up_ci).

In the command line, run the following to install `qawolf` as a dev dependency in your project:

```bash
npm i -D qawolf
```

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/8d08948a3080e1c2abcf0489a40a653b39d5e98e)

## Create a smoke test

Now let's create our first smoke test. In this tutorial, we'll smoke test [TodoMVC](http://todomvc.com/examples/react), a simple todo application. Specifically, we'll create a todo item, complete it, and clear completed todos.

When we run the `npx qawolf record` command, a [Chromium](https://www.chromium.org/Home) browser will open and capture our actions such as clicks and typing into inputs. These actions will then be converted to [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code (more on this in the [review code section](smoke_tests_with_alerts#review-smoke-test-code)).

To record your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstSmokeTest` with a different name.

```bash
npx qawolf record http://todomvc.com/examples/react myFirstSmokeTest
```

Inside the Chromium browser, go through the workflow you want to test as a user would. In our example, we'll 1) create a todo item, 2) mark it as complete, and 3) clear completed todos. After you are done, return to the terminal and hit Enter to save your test. See the video below for an example.

TODO: INSERT VIDEO

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/caa0fccc1ee3472b2108fd03148cac6c6848134c) We'll dive deeper into the test code shortly, but first let's run our test locally.

## Run smoke test locally

Let's run our test to confirm it works locally. In the command line, run the following (replacing `myFirstSmokeTest` with your test name if applicable):

```bash
npx qawolf test myFirstSmokeTest
```

A Chromium browser will open and the test will run. See the video below for an example.

TODO: INSERT VIDEO

## Review smoke test code

Here we'll review our test code and optionally edit it. You'll notice that a folder with the name `.qawolf` was created at the root level of your project. This folder holds two more folders: `.qawolf/tests` and `.qawolf/selectors`. Our test is in the `.qawolf/tests` folder with the name `myFirstSmokeTest.test.js` (or whatever else you named your test). The `.qawolf` directory structure is shown below.

```bash
.qawolf # current directory
├── tests
│   └── myFirstSmokeTest.test.js
├── selectors
│   └── myFirstSmokeTest.json
```

Let's look at the generated test code in `.qawolf/tests/myFirstSmokeTest.test.js`. The test code includes the `qawolf` library, which is built on top of [Puppeteer](https://pptr.dev/) to automate browser actions.

In short, the following code will first open a Chromium browser with our desired URL. It then goes through each step in our workflow. In our case, we 1) type our todo item into the first element we interacted with, 2) hit Enter, 3) click to complete the todo, and 4) click the "clear completed" button. Each of these steps corresponds to a [Jest test case](https://jestjs.io/docs/en/api#testname-fn-timeout). After the test is complete, the browser is closed.

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/myFirstSmokeTest");

describe("myFirstSmokeTest", () => {
  let browser;

  beforeAll(async () => {
    browser = await launch({ url: "http://todomvc.com/examples/react" });
  });

  afterAll(() => browser.close());

  it('can type into "What needs to be done?" input', async () => {
    await browser.type(selectors[0], "create smoke test!");
  });

  it("can Enter", async () => {
    await browser.type(selectors[1], "↓Enter↑Enter");
  });

  it("can click input", async () => {
    await browser.click(selectors[2]);
  });

  it('can click "Clear completed" button', async () => {
    await browser.click(selectors[3]);
  });
});
```

A few other things about the test code are worth mentioning before we move on.

### Element Selectors

First, the `click` and `type` methods on `browser` take an object of [type `Selector`](api#interface-selector). By default, these selectors are stored in the `.qawolf/selectors/myFirstSmokeTest.json` file. The test code then imports them:

```js
const selectors = require("../selectors/myFirstSmokeTest");
```

Each generated selector is an object. The object includes the following keys:

- `index`: which step number the element corresponds to, starting at `0`
- `page`: which page number the element is on (relevant when the workflow has mulitple pages or tabs)
- `html`: the `node` that was interacted with, and its two direct `ancestors`

Below is an example of a selector object:

```json
{
  "index": 0,
  "page": 0,
  "html": {
    "ancestors": [
      "<header class=\"header\" data-reactid=\".0.0\"></header>",
      "<div data-reactid=\".0\"></div>"
    ],
    "node": "<input class=\"new-todo\" placeholder=\"What needs to be done?\" value=\"\" data-reactid=\".0.0.1\"/>"
  }
}
```

You don't need to worry too much about the selector object. The most important point is that it includes all the information it can about the target element and its two ancestors. The `qawolf` library can therefore find the target element based on multiple attributes. This helps make tests robust to changes in your application as well as dynamic attributes like CSS classes. If a close enough match for the target element is not found, the test will fail.

You can optionally replace the default selector with a custom CSS or text selector (more on this in the [edit code section](smoke_tests_with_alerts#optional-edit-smoke-test-code)). See documentation on [how element selectors work](how_it_works#-element-selectors) and on [the `Selector` interface](api#interface-selector) to learn more.

### Automatic Waiting

Second, the `click` and `type` methods on the `browser` automatically wait for element to appear before moving on. For example, after we click to complete our todo, it takes a bit of time for the "clear completed" button to appear on the page. In this case, the `qawolf` library will keep looking for the "clear completed" button until it appears, at which point it will be clicked.

Automatic waiting allows us to avoid writing custom waiting logic or arbitrary sleep statements. See documentation on the [QA Wolf Browser class](api#class-browser) and on [automatic waiting](how_it_works#️-automatic-waiting) to learn more.

At this point, feel free to create additional smoke tests before moving on.

## Optional: Edit smoke test code

You can use the test code as is to verify that the workflow isn't broken. If a step of the workflow cannot be executed because no match is found for the target element, the test will fail.

However, you can still edit the test code to suit your use case. This section provides examples for [adding an assertion](smoke_tests_with_alerts#add-an-assertion), [using a custom CSS or text selector](smoke_tests_with_alerts#use-custom-selector) for an element, or [changing an input value](smoke_tests_with_alerts#change-input-values). Each section is self-contained, so feel free to skip to the section(s) of interest.

### Add an assertion

### Use custom selector

### Change input values

## Run smoke tests on a schedule

## Set up alerts on failure

## Next steps
