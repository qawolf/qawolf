---
id: edit_a_test
title: 📝 Edit a Test
---

As your application changes, you may want to update the steps in an existing test. Rather than create a new test from scratch, you can use QA Wolf to add steps to your existing code.

## TL;DR

- [Call `qawolf.create`](#call-qawolfcreate) in your test where you want new code to be inserted:

```js
// ...
test('myTestName', async () => {
  await page.goto('www.myawesomesite.com');
  // ...
  await qawolf.create();
  // ...
});
```

- [Run your test](#run-your-test), and use the browser to add new steps where `qawolf.create` is called:

```bash
npx qawolf test --repl myTestName
```

## Call `qawolf.create`

Let's say we want to update our test on [TodoMVC](http://todomvc.com/examples/react) from the [create a test](create_a_test) guide. Our current test only creates one todo item, but now we want to test creating a second todo item.

For reference, our test code looks like this:

```js
const qawolf = require('qawolf');
const selectors = require('./selectors/myFirstTest.json');

let browser;
let page;

beforeAll(async () => {
  browser = await qawolf.launch();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['3_input']);
  await page.click(selectors['4_button']);
});
```

Let's update our test to create a second todo item after the first. To do this, we'll call the [`qawolf.create` method](api/qawolf/create) after the press `Enter` step. When we run our test, it will pause at the call to `qawolf.create` and allow us to add new actions to our code.

In your test code, call `qawolf.create` in your [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout). Below we provide an example:

```js
// ...
test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  // add this line
  await qawolf.create();
  await page.click(selectors['3_input']);
  await page.click(selectors['4_button']);
});
```

## Run your test

Now let's run our test with the [`npx qawolf test` command](api/cli#npx-qawolf-test-name). Include the `--repl` flag if you want to be able to access the [REPL](use_the_repl):

```bash
npx qawolf test --repl myFirstTest
```

The first few steps of our test will now run. For TodoMVC, this means that the first todo item will be created. The test will then pause where `qawolf.create` is called. You'll notice that `qawolf.create` is replaced with `// 🐺 CREATE CODE HERE` in your code:

```js
// ...
test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  // 🐺 CREATE CODE HERE
  await page.click(selectors['3_input']);
  await page.click(selectors['4_button']);
});
```

Any actions you take in the browser will be converted to code and inserted where `// 🐺 CREATE CODE HERE` is. To add a second todo item, let's 1) click on the todo input to focus it, 2) type `update test!`, and 3) press `Enter` to save the todo. Our test code now looks like this:

```js
// ...
test('myFirstTest', async () => {
  await page.goto('http://todomvc.com/examples/react');
  await page.click(selectors['0_what_needs_to_b_input']);
  await page.type(selectors['1_what_needs_to_b_input'], 'create test!');
  await page.press(selectors['2_what_needs_to_b_input'], 'Enter');
  await page.click(selectors['5_what_needs_to_b_input']);
  await page.type(selectors['6_what_needs_to_b_input'], 'update test!');
  await page.press(selectors['7_what_needs_to_b_input'], 'Enter');
  // 🐺 CREATE CODE HERE
  await page.click(selectors['3_input']);
  await page.click(selectors['4_button']);
});
```

Now that we've added our second todo item, let's save our test. In the command line, choose `💾 Save and exit` to finish running your test. Your test will run any additional steps (in our example, complete the first todo and clear completed todos). The line `// 🐺 CREATE CODE HERE` will also be removed from your test code.

To run your updated test, use the following command:

```bash
npx qawolf test myFirstTest
```

You'll notice that two todo items are created in our updated test.

## Next steps

Congratulations - you've learned how add steps to an existing test! 🎉

There are a few places you might want to go from here:

- Learn more about the [interactive REPL](use_the_repl)
- Learn how to [handle sign in programmatically](handle_sign_in)
