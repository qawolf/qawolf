---
id: add_assertions
title: 💪 Add Assertions
---

In this guide we show you how to add assertions to your tests. We assume that you know how to [create a test](create_a_test).

## TL;DR

- [Create assertions](#create-assertions) with the [expect-playwright](https://github.com/playwright-community/expect-playwright) library (included with QA Wolf by default):

```js
await expect(page).toHaveText('Clear completed');
await expect(page).not.toHaveSelector('.todo-list li');
```

- Use [watch mode](edit_a_test#watch-mode) to automatically re-run your tests on save

## Create assertions

In this guide, we'll add assertions to our test on [TodoMVC](http://todomvc.com/examples/react).

We recommend adding assertions with the [expect-playwright library](https://github.com/playwright-community/expect-playwright), which automatically waits for assertions. QA Wolf includes this library by default, so you do not need to install anything to use it.

### Assert that text appears

The first assertion we will add is to check that the text `"Clear completed"` appears after we complete our todo. Specifically, we will call expect-playwright's [`toHaveText` method](https://github.com/playwright-community/expect-playwright#tohavetext) to verify that the text appears on the page.

In our test code, let's add a line to assert that the text `"Clear completed"` appears on the page:

```js
// ...

test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  // custom code starts
  await expect(page).toHaveText('Clear completed');
  // custom code ends
  await page.click(selectors['4_button']);
});
```

If you use [edit mode](edit_a_test) (`npx qawolf edit myTestName`) to [watch for changes](edit_a_test#watch-mode), your test will re-run automatically when you save it. Otherwise, run your test again (`npx qawolf test myTestName`) to see that it still passes.

### Assert that an element appears

Next we'll add an assertion that our todo is no longer visible after we clear completed todos. In terms of the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), this means that there should be no todo `li` elements under the todo `ul` with the [class](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) `"todo-list"`.

We'll use the [`toHaveSelector` method](https://github.com/playwright-community/expect-playwright#toHaveSelector) to assert that the CSS selector `".todo-list li"` does not appear on the page after we clear completed todos.

Our test now looks like this:

```js
// ...

test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  // custom code starts
  await expect(page).toHaveText('Clear completed');
  // custom code ends
  await page.click(selectors['4_button']);
  // custom code starts
  await expect(page).not.toHaveSelector('.todo-list li');
  // custom code ends
});
```

If you run the test again, you'll see that it still passes. If the todo item did not disappear from the page, our test would fail.

## Next steps

Congratulations - you've learned how to write assertions in your tests! 🎉

There are a few places you might want to go from here:

- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
