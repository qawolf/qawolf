---
id: use_the_repl
title: 🔁 Use the REPL
---

As you create a test, you may want to try out code to include in your test file. The interactive [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) lets you run [Node.js](https://nodejs.org/en) code. It also gives you access to the [QA Wolf API](api/table_of_contents) and [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md).

## TL;DR

- [Open the REPL](#open-the-repl) by selecting `🖥️ Open REPL to run code` while creating a test
- You can [run Node.js code in the REPL](#run-code-in-the-repl)
- [Close the REPL](#close-the-repl) by typing `.exit`
- You can also [use the REPL when editing a test](#use-repl-when-editing-a-test)

## Open the REPL

When you run the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name), you'll notice a few options become available in the command line. These options are:

- `💾 Save and Exit`: saves your test code and closes the browser
- `🖥️ Open REPL to run code`: opens the QA Wolf interactive REPL so you can try out code
- `🗑️ Discard and Exit`: closes the browser without saving your test code

Use the up and down arrow keys to choose between options. To open the REPL, highlight `🖥️ Open REPL to run code` and press `Enter`.

## Run code in the REPL

You will now be able to run [Node.js](https://nodejs.org/en) in the command line, as well as access the [QA Wolf API](api/table_of_contents) and [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md).

Type `1 + 1` in the REPL and press `Enter`. The result `2` will print below the command. In short, any code you could run in the [Node.js](https://nodejs.org/en) REPL can also be run here.

You can also use the [QA Wolf API](api/table_of_contents) in the REPL. By default, the REPL provides access to the [Playwright `BrowserContext`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext) instance (`context`), [Playwright `Page`](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page) instance (`page`), and `qawolf`.

Now let's say we have just started to create a test on [TodoMVC](http://todomvc.com/examples/react). We can create a todo item from the REPL.

We can type in the `input` with the class `"new-todo"` using [Playwright's `page.type` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagetypeselector-text-options). In the REPL, type:

```js
await page.type('input.new-todo', 'Hello from the REPL!');
```

We can save our todo item with [Playwright's `page.press`](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagepressselector-key-options) method. In the REPL, type the following to press `Enter`:

```js
await page.press('input.new-todo', 'Enter');
```

You should see a todo item called `"Hello from the REPL!"` created in the browser.

Now let's get the current count of todo items on the page using Playwright's [`page.$$eval` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevalselector-pagefunction-args). The todo items are stored as `li` elements under the `ul` with the class `"todo-items"`:

```js
await page.$$eval('.todo-list li', (todos) => todos.length);
```

The result of this command should be `1`, as we currently have one todo item on the page.

In summary, the REPL allows us to try out code that we may want to incorporate into our tests. You can open your test file at `.qawolf/myTest.test.js` any time and edit it as you go along.

## Close the REPL

When you are done using the REPL, type `.exit` in the command line. This will close the REPL and show the original options again (`💾 Save and Exit`, `🖥️ Open REPL to run code`, and `🗑️ Discard and Exit`).

## Use REPL when editing a test

You can also open the REPL when editing a test. The [`repl` method](api/qawolf/repl) allows you to use the REPL to debug existing tests.

Call `qawolf.repl` any number of times in your test code, passing whatever values you want to be able to access. The `context`, `page`, and `qawolf` are included by default, so you do not need to pass them to `qawolf.repl`:

```js
const qawolf = require('qawolf');
// ...

test('myTest', async () => {
  await qawolf.repl();
});
```

Run your test in [edit mode](edit_a_test):

```bash
npx qawolf edit myTest
```

When the test encounters a `repl` call, it will pause and the REPL will open.

After you are done using the REPL, type `.exit` to continue running your test. Your test will proceed until it encounters another `repl` call or finishes running.

Make sure to remove `repl` calls from your test code after you finish debugging!

## Next steps

Congratulations - you've learned how to use the QA Wolf REPL! 🎉

There are a few places you might want to go from here:

- Learn how to [edit an existing test](edit_a_test)
- Learn how to [handle sign in programmatically](handle_sign_in)
