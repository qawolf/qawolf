---
id: change_input_values
title: 📮 Change Input Values
---

## TL;DR

- You can [change input values](#change-input-values) in your test code:

```js
// change this
await page.type('.new-todo', 'create test!');
// to this
await page.type('.new-todo', ':)');
```

- **Always replace sensitive values like passwords [with environment variables](#use-environment-variables)**:

```js
// change this
await page.type('.new-todo', 'secret value');
// to this
await page.type('.new-todo', process.env.TODO_VALUE);
```

## Change input values

When QA Wolf captures your `type` actions, whatever you originally typed is included in the test by default. You may want to change your test code to use a different value than the one you originally typed.

In an example test on [TodoMVC](http://todomvc.com/examples/react), we typed `"create test!"` as our todo item in the first step of our test. The following code was then generated:

```js
await page.type('.new-todo', 'create test!');
```

However, you may want to change this input value to something else. The simplest way to do this is to change the second argument to [`page.type`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagetypeselector-text-options) from the value you originally typed to your desired value:

```js
// change this
await page.type('.new-todo', 'create test!');
// to this
await page.type('.new-todo', ':)');
```

Note that you can edit your code [as your test is created](create_a_test#review-test-code), or after you've completed it.

If you run the test again, you'll notice that it now types the updated value (`":)"` in our example) in the edited step.

You can also configure your tests to input dynamic values with [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) code. In the example below we type the current date as our todo item. To get the current date, we call the [`toString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toString) method on a new [`Date` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date):

```js
// change this
await page.type('.new-todo', 'create test!');
// to this
await page.type('.new-todo', new Date().toString());
```

## Use environment variables

Rather than pass an input value directly to [`page.type`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagetypeselector-text-options), you can use an environment variable. Update the test code to use `process.env.YOUR_ENV_VARIABLE` (`TODO_VALUE` in the example below):

```js
// change this
await page.type('.new-todo', 'secret value');
// to this
await page.type('.new-todo', process.env.TODO_VALUE);
```

You can then run your test again, passing the appropriate environment variable. It will now type the value of your environment variable in the first step:

```bash
TODO_VALUE="hello env variable!" npx qawolf test myTest
```

**You should always replace sensitive values like passwords with environment variables.** Use the above example as a reference for updating the test code and running it locally. When running tests in CI, be sure to [update your configuration to include the environment variable](run_tests_in_ci#use-environment-variables).

## Next steps

Congratulations - you've learned how to change input values in your tests! 🎉

There are a few places you might want to go from here:

- [Use custom element selectors](use_custom_selectors) in your tests
- Learn more about the [interactive REPL](use_the_repl)
