---
id: add_assertions
title: 💪 Add Assertions
---

In this guide we show you how to add assertions to your tests. We assume that you know how to [create a test](create_a_test).

## TL;DR

- [Use the Playwright API](#use-the-playwright-api) to create assertions:

```js
await page.waitFor(() => document.body.innerText.includes('Clear completed'));

await page.waitFor(() => !document.querySelector('.todo-list li'));
```

- The [interactive REPL](use_the_repl) lets you try out assertions while creating tests

## Use the Playwright API

In this guide, we'll add assertions to a test on [TodoMVC](http://todomvc.com/examples/react).

You can add assertions as you create your test, since the [test code is generated](create_a_test#review-test-code) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out code.

The first assertion we will add is to check that the text `"Clear completed"` appears after we complete our todo. We'll do this using Playwright's [`page.waitFor` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#framewaitforselectororfunctionortimeout-options-args), which waits for the specified function to return `true`. Specifically, we will pass it a function that waits until the text `"Clear completed"` appears.

In our test code, let's call `page.waitFor`, passing it a function that returns whether the [`document.body`](https://developer.mozilla.org/en-US/docs/Web/API/Document/body)'s [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText) includes `"Clear completed"`. Our test will wait until this funciton returns `true`. If the function never returns `true` before timing out, the test will fail.

```js
test('myFirstTest', async () => {
  await qawolf.repl({ selectors });
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  // custom code starts
  await page.waitFor(() => document.body.innerText.includes('Clear completed'));
  // custom code ends
  await page.click(selectors['4_button']);
});
```

If you run the test again (`npx qawolf test myTestName`), you'll see that it still passes.

Next we'll add an assertion that our todo is no longer visible after we clear completed todos. In terms of the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), this means that there should be no todo `li` elements under the todo `ul` with the [class](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) `"todo-list"`.

We'll call `page.waitFor`, passing it a function that returns `true` when no elements match the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `".todo-list li"`. We use the [`document.querySelector` method](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) to check if an element matches our selector.

Our test now looks like this:

```js
test('myFirstTest', async () => {
  await qawolf.repl({ selectors });
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  // custom code starts
  await page.waitFor(() => document.body.innerText.includes('Clear completed'));
  // custom code ends
  await page.click(selectors['4_button']);
  // custom code starts
  await page.waitFor(() => !document.querySelector('.todo-list li'));
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
