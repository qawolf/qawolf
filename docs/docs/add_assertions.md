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

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Playwright Page instance
  const page = await browser.page();
  // wait until no more todo items appear
  await page.waitFor(() => !document.querySelector(".todo-list li"));
  // custom code ends
});
```

- The [interactive REPL](use_the_repl) lets you try out assertions while creating tests

## Use QA Wolf helpers

In this guide, we'll add assertions to a test on [TodoMVC](http://todomvc.com/examples/react). The video below shows this test running:

TODOADDVIDEO

You can add assertions as you create your test, since the [test code is generated](create_a_test#review-test-code) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out code.

The first assertion we will add is to check that the text `"Clear completed"` appears after we complete our todo.

We'll use QA Wolf's [`browser.hasText` method](api/browser_context/has_text) to verify that the text appears. This method automatically waits for the given text to appear on the page. It returns `true` if the text is found, and `false` if the text does not appear before timing out.

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

See our [API documentation](api/table_of_contents) for a full list of QA Wolf helpers.

## Use the Playwright API

In addition to QA Wolf helpers, you also have full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md) and the [Jest API](https://jestjs.io/docs/en/expect) in your test code.

Next we'll add an assertion that our todo is no longer visible after we clear completed todos. In terms of the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), this means that there should be no todo `li` elements under the todo `ul` with the [class](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) `"todo-list"`.

The Playwright API provides a [method called `page.waitFor`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagewaitforselectororfunctionortimeout-options-args) that takes a predicate function and waits until the function returns `true`. We'll call this method, passing it a function to check that there are no todo items left on the page.

Putting it all together, after our test clicks the "Clear completed" button to clear completed todos, we will verify that the todos disappear from the page. We'll do this by:

1. Calling [`browser.page`](api/browser_context/page) to get the current Playwright `Page` instance
2. Calling [`page.waitFor`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagewaitforselectororfunctionortimeout-options-args), passing it a function that checks to see that there are no elements that match the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `.todo-list li`.

The last step of our test code now looks like this:

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Playwright Page instance
  const page = await browser.page();
  // wait until no more todo items appear
  await page.waitFor(() => !document.querySelector(".todo-list li"));
  // custom code ends
});
```

If you run the test again (`npx qawolf test myTestName`), you'll see that it still passes. If the todo item did not disappear from the page, an error would be thrown by `page.waitFor` and our test would fail.

## Next steps

Congratulations - you've learned how to write assertions in your tests! 🎉

There are a few places you might want to go from here:

- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
- Learn more about the [interactive REPL](use_the_repl)
