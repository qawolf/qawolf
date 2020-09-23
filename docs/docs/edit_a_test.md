---
id: edit_a_test
title: 📝 Edit a Test
---

As your application changes, you may want to update the steps in an existing test. Rather than create a new test from scratch, you can use QA Wolf to add steps to your existing code.

## TL;DR

- [Call `qawolf.create`](#call-qawolfcreate) in your test where you want new code to be inserted:

```js
// ...
test('myTest', async () => {
  const page = await context.newPage();
  await page.goto('www.myawesomesite.com');
  // ...
  await qawolf.create();
  // ...
});
```

- [Run your test in edit mode](#use-edit-mode), and use the browser to add new steps where `qawolf.create` is called:

```bash
npx qawolf edit myTest
```

- [Use watch mode](#watch-mode) to automatically re-run your tests on save: `npx qawolf edit --watch`

## Call `qawolf.create`

Let's say we want to update our test on [TodoMVC](http://todomvc.com/examples/react) from the [create a test](create_a_test) guide. Our current test only creates one todo item, but now we want to test creating a second todo item.

For reference, our test code is saved at `.qawolf/myTest.test.js` and looks like this:

```js
const qawolf = require('qawolf');

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext();
  await qawolf.register(context);
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('myTest', async () => {
  const page = await context.newPage();
  await page.goto('http://todomvc.com/examples/react');
  await page.click('[placeholder="What needs to be done?"]');
  await page.type('[placeholder="What needs to be done?"]', 'create test!');
  await page.press('[placeholder="What needs to be done?"]', 'Enter');
  await page.click('.toggle');
  await page.click('text=Clear completed');
});
```

Let's update our test to create a second todo item after the first. To do this, we'll call the [`qawolf.create` method](api/qawolf/create) after the press `Enter` step. When we run our test in edit mode, it will pause at the call to `qawolf.create` and allow us to add new actions to our code.

In your test code, call `qawolf.create` in your [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout). Our test code now looks like this:

```js
// ...

test('myTest', async () => {
  const page = await context.newPage();
  await page.goto('http://todomvc.com/examples/react');
  await page.click('[placeholder="What needs to be done?"]');
  await page.type('[placeholder="What needs to be done?"]', 'create test!');
  await page.press('[placeholder="What needs to be done?"]', 'Enter');
  await qawolf.create(); // add this line
  await page.click('.toggle');
  await page.click('text=Clear completed');
});
```

## Use edit mode

Now let's run our test in edit mode, which allows us to add steps to an existing test. Run the [`npx qawolf edit` command](api/cli#npx-qawolf-edit-name), and specify the name of your test file (`myTest` in our example):

```bash
npx qawolf edit myTest
```

The first few steps of our test will now run. For TodoMVC, this means that the first todo item will be created. The test will then pause where `qawolf.create` is called and replace it with a comment: `// 🐺 create code here`.

```js
// ...

test('myTest', async () => {
  const page = await context.newPage();
  await page.goto('http://todomvc.com/examples/react');
  await page.click('[placeholder="What needs to be done?"]');
  await page.type('[placeholder="What needs to be done?"]', 'create test!');
  await page.press('[placeholder="What needs to be done?"]', 'Enter');
  // 🐺 create code here
  await page.click('.toggle');
  await page.click('text=Clear completed');
});
```

Any actions you take in the browser will be converted to code and inserted where `// 🐺 create code here` is. To add a second todo item, let's 1) click on the todo input to focus it, 2) type `update test!`, and 3) press `Enter` to save the todo. Our test code now looks like this:

```js
// ...

test('myTest', async () => {
  const page = await context.newPage();
  await page.goto('http://todomvc.com/examples/react');
  await page.click('[placeholder="What needs to be done?"]');
  await page.type('[placeholder="What needs to be done?"]', 'create test!');
  await page.press('[placeholder="What needs to be done?"]', 'Enter');
  await page.click('[placeholder="What needs to be done?"]');
  await page.type('[placeholder="What needs to be done?"]', 'update test!');
  await page.press('[placeholder="What needs to be done?"]', 'Enter');
  // 🐺 create code here
  await page.click('.toggle');
  await page.click('text=Clear completed');
});
```

Now that we've added our second todo item, let's save our test. In the command line, choose `💾 Save and exit` to save your updated test. The line `// 🐺 create code here` will be removed when your test is saved.

To run your updated test, use the following command:

```bash
npx qawolf test myTest
```

You'll notice that two todo items are created in our updated test.

## Watch mode

QA Wolf allows you to edit tests in watch mode. Watch mode will re-run your test when you save the file.

To run your test in watch mode, use the [`npx qawolf edit --watch` command](api/cli#npx-qawolf-edit-name). Pass it a string that matches exactly one test file name. For example, `myTest` will match `.qawolf/myTest.test.js`:

```bash
npx qawolf edit --watch myTest
```

Now your test will re-run automatically whenever you edit your test file and save it. To exit edit mode, type `Control` + `C` in the command line.

## Next steps

Congratulations - you've learned how add steps to an existing test! 🎉

There are a few places you might want to go from here:

- Learn more about the [interactive REPL](use_the_repl)
- Learn how to [handle sign in programmatically](handle_sign_in)
