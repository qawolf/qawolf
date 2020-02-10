---
id: change_input_values
title: 📮 Change Input Values
---

## TL;DR

- [QA Wolf captures type actions](#keyboard-events-overview) when you create tests
- You can [change input values](#change-input-values) in your test code:

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "create test!");
  // to this
  await browser.type(selectors[0], "update test!");
});
```

- **Always replace sensitive values like passwords [with environment variables](#use-environment-variables)**:

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "secret value");
  // to this
  await browser.type(selectors[0], process.env.TODO_VALUE);
});
```

## Keyboard events overview

When you create a test, QA Wolf converts your `type` actions to test code. This code includes both the element that you typed into, as well as the value you typed. See [our selectors overview](use_custom_selectors#selectors-overview) to learn more about how element selectors work.

To capture the values you type, QA Wolf listens for `keydown` and `keyup` events so it can perfectly match the original keystrokes. This allows us to support special keys like `Tab`, `Enter`, and hotkeys.

These keystrokes are then included in your test code as the second argument to [`browser.type`](api/browser/type). This argument is the value that will be typed when your test is run. If no special characters are found, the keystrokes are simplified to a plain [`string`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) for human readability. Otherwise, they are included in the test code as is.

Below we show sample generated code after typing into an input:

```js
// original key events
await browser.type(
  selectors[0],
  "↓KeyL↑KeyL↓KeyA↓KeyU↑KeyA↓KeyR↑KeyU↑KeyR↓KeyA↑KeyA"
);

// simplified
await browser.type(selectors[0], "laura");
```

When a special key like `Enter` is pressed, all keyboard events are included in the generated test code. This allows the correct keystrokes to be used when running your test:

```js
await browser.type(selectors[1], "↓Enter↑Enter");
```

## Change input values

When capturing `type` actions, whatever you originally typed will be included in the test by default. You may want to change your test code to use a different value than the one you originally typed.

In an example test on [TodoMVC](http://todomvc.com/examples/react), we typed `"create test!"` as our todo item in the first step of our test. The following code was then generated:

```js
it('can type into "What needs to be done?" input', async () => {
  await browser.type(selectors[0], "create test!");
});
```

However, you may want to change this input value to something else. The simplest way to do this is to change the second argument to [`browser.type`](api/browser/type) from the value you originally typed to your desired value:

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "create test!");
  // to this
  await browser.type(selectors[0], "update test!");
});
```

Note that you can edit your code [as your test is created](create_a_test#review-test-code), or after you've completed it.

If you run the test again, you'll notice that it now types the updated value (`"update test!"` in our example) in the edited step.

You can also configure your tests to input dynamic values with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) code. In the example below we type the current date as our todo item. To get the current date, we call the [`toString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toString) method on a new [`Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date):

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "create test!");
  // to this
  await browser.type(selectors[0], new Date().toString());
});
```

## Use environment variables

Rather than pass an input value directly to [`browser.type`](api/browser/type), you can use an environment variable. Update the test code to use `process.env.YOUR_ENV_VARIABLE` (`TODO_VALUE` in the example below):

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "secret value");
  // to this
  await browser.type(selectors[0], process.env.TODO_VALUE);
});
```

You can then run your test again, passing the appropriate environment variable. It will now type the value of your environment variable in the first step:

```bash
TODO_VALUE="create environment variable!" npx qawolf test myTestName
```

**You should always replace sensitive values like passwords with environment variables.** Use the above example as a reference for updating the test code and running it locally. When running tests in CI, be sure to [update your configuration to include the environment variable](run_tests_in_ci#use-environment-variables).

## Next steps

Congratulations - you've learned how to change input values in your tests! 🎉

There are a few places you might want to go from here:

- [Add assertions](add_assertions) to your tests
- [Use custom element selectors](use_custom_selectors) in your tests
- Learn more about the [interactive REPL](use_the_repl)
