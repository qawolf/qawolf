---
id: add_assertions
title: 💪 Add Assertions
---

In this guide we show you how to add assertions to your tests. We assume that you know how to [create a test](create_a_test).

## TL;DR

- [Use QA Wolf helpers](#use-qa-wolf-helpers) to create assertions:

```js
it("can click input", async () => {
  await browser.click(selectors[2]);

  // custom code starts
  // verify that "Clear completed" text appears
  const hasClearCompletedText = await browser.hasText("Clear completed");
  expect(hasClearCompletedText).toBe(true);
  // custom code ends
});
```

- [Use the Playwright API](#use-the-playwright-api) to create assertions:

TODOUPDATE

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Playwright page instance
  const page = await browser.page();

  // verify that todos disappear after clearing completed
  await waitUntil(async () => {
    // find the todos section on the page
    const todosSection = await page.$("section.main");
    // return true once the secton is null (no longer exists)
    return todosSection === null;
  }, 15000); // wait 15 seconds before timing out
  // custom code ends
});
```

- The [interactive REPL](use_the_repl) lets you try out assertions while creating tests

## Use QA Wolf helpers

In this guide, we'll add assertions to a test on [TodoMVC](http://todomvc.com/examples/react). The video below shows this test running:

TODOADDVIDEO

You can add assertions as you create your test, since the [test code is generated](TODOFIXLINK) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out code.

The first assertion we will add is to check that the "Clear completed" text appears after we complete our todo.

We'll use QA Wolf's [`browser.hasText` method](TODOFIXLINK) to verify that the text appears. This method automatically waits for the given text to appear on the page. It returns `true` if the text is found, and `false` if the text does not appear before timing out.

In our test code, let's update the following step where we click to complete the todo. We'll call `browser.hasText("Clear completed")`, assign the result to a variable called `hasClearCompletedText`, and assert that `hasClearCompletedText` is `true`. See [Jest documentation](https://jestjs.io/docs/en/expect) to learn more about assertions.

```js
it("can click input", async () => {
  await browser.click(selectors[2]);

  // custom code starts
  // verify that "Clear completed" text appears
  const hasClearCompletedText = await browser.hasText("Clear completed");
  expect(hasClearCompletedText).toBe(true);
  // custom code ends
});
```

If you run the test again (`npx qawolf test myTestName`), you'll see that it still passes.

See our [API documentation](TODOFIXLINK) for a full list of QA Wolf helpers.

## Use the Playwright API

In addition to QA Wolf helpers, you also have full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md) and [Jest API](https://jestjs.io/docs/en/expect) in your test code.

Next we'll add an assertion that our todo is no longer visible after we clear completed todos. In terms of the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), this means that the todos `<section>` with the [class](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class) of `main` should no longer exist on the page.

The Playwright API provides a method called [`page.$`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageselector) that runs [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) within a [`Page` instance](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page). We'll call this method, passing it the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `section.main`. If the TodoMVC application is working correctly, there should be no `<section>` element with the class of `main` after todos are cleared.

We'll also use the QA Wolf [helper method `waitUntil`](TODOFIXLINK), which takes a function and a timeout in milliseconds. It waits until the function returns `true`, throwing an error if the timeout is reached.

Putting it all together, after our test clicks the "Clear completed" button to clear completed todos, we will verify that the todos disappear from the page. We do this by:

1. Calling [`browser.page`](TODOFIXLINK) to get the current Playwright page instance
2. Calling [`waitUntil`](TODOFIXLINK) to wait for the `section.main` element to disappear
3. Passing `waitUntil` a function that calls [`page.$`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageselector) with the CSS selector `section.main` and returns `true` when it is `null` (todos container is no longer on the page)

First, we update the first line of our test file to also import `waitUntil` from `qawolf`:

```js
// change this
const { launch } = require("qawolf");
// to this
const { launch, waitUntil } = require("qawolf");
```

Then we update the final step of our test:

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Playwright page instance
  const page = await browser.page();

  // verify that todos disappear after clearing completed
  await waitUntil(async () => {
    // find the todos section on the page
    const todosSection = await page.$("section.main");
    // return true once the secton is null (no longer exists)
    return todosSection === null;
  }, 15000); // wait 15 seconds before timing out
  // custom code ends
});
```

If you run the test again (`npx qawolf test myTestName`), you'll see that it still passes.

TODODOESITWORK

## Next steps

Congratulations - you've learned how to write assertions in your tests! 🎉

There are a few places you might want to go from here:

- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
- Learn more about the [interactive REPL](use_the_repl)
