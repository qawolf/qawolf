---
id: use_the_repl
title: 🔁 Use the REPL
---

As you create a test, you may want to try out code to include in your test file. The interactive [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) lets you run [Node.js](https://nodejs.org/en) code and gives you access to the [QA Wolf API](api/table_of_contents).

TODOUPDATE

## TL;DR

- [Open the REPL](#open-the-repl) by selecting `🖥️ Open REPL to run code` when creating a test
- You can [run Node.js code in the REPL](#run-code-in-the-repl)
- [Close the REPL](#close-the-repl) by typing `.exit`

## Open the REPL

When you run the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name), you'll notice a few options become available in the command line. These options are:

- `💾 Save and Exit`: saves your test code and closes the browser
- `🖥️ Open REPL to run code`: opens the QA Wolf interactive REPL so you can try out code
- `🗑️ Discard and Exit`: closes the browser without saving your test code

Use the up and down arrow keys to choose between options. To open the REPL, choose `🖥️ Open REPL to run code`.

## Run code in the REPL

You will now be able to run [Node.js](https://nodejs.org/en) in the command line, as well as access the [QA Wolf API](api/table_of_contents).

As a simple test, type `1 + 1` in the REPL and hit `Enter`. The result `2` will print below the command. In short, any code you could run in the [Node.js](https://nodejs.org/en) REPL can also be run here.

You can also use the [QA Wolf API](api/table_of_contents) in the REPL. For example, let's say we have just started to create a test on [TodoMVC](http://todomvc.com/examples/react). We can create a todo item through the REPL.

First, let's type in the `input` with the class `"new-todo"` and then hit `Enter` to save our todo. To do this, we will call the [`browser.type` method](api/browser/type). In the REPL, type:

```js
await browser.type({ css: "input.new-todo" }, "Hello from the REPL!");
await browser.type({ css: "input.new-todo" }, "↓Enter↑Enter");
```

You will see a todo item called `"Hello from the REPL!"` created in the browser.

We can then click to complete our todo item, using the [`browser.click` method](api/browser/click). In TodoMVC, you complete a todo by clicking on the `input` with the class `"toggle"`:

```js
await browser.click({ css: "input.toggle" });
```

You should see the todo item be marked as complete in the browser.

Now let's try out an assertion using the [`browser.hasText` method](api/browser/has_text). We'll verify that the text `"Clear completed"` now appears since we have completed a todo:

```js
await browser.hasText("Clear completed");
```

The result of this command should be `true`, as the text `"Clear completed"` is on the page.

QA Wolf is built on top of [Microsoft's Playwright](https://github.com/microsoft/playwright), which has a [rich API](https://github.com/microsoft/playwright/blob/master/docs/api.md) that you can use. The methods on the [`Page` class](https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page) can be particularly helpful.

Let's get the current Playwright `Page` instance using the [`browser.page` method](api/browser/page):

```js
const page = await browser.page();
```

We can now call Playwright's [`page.$$eval` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevalselector-pagefunction-args) to get the current count of todo items. These items are stored as `li` elements under the `ul` with the class `"todo-items"`:

```js
await page.$$eval(".todo-list li", todos => todos.length);
```

The result of this command should be `1`, as we currently have one todo item on the page.

The video below shows us using the REPL to try out the code examples in this section:

TODOADDVIDEO

In summary, the REPL allows us to try out code that we may want to incorporate into our tests. As a reminder, you can open your test file at `.qawolf/tests/myTestName.test.js` any time and edit it as you go along.

## Close the REPL

When you are done using the REPL, type `.exit` in the command line. This will close the REPL and show the original options again (`💾 Save and Exit`, `🖥️ Open REPL to run code`, and `🗑️ Discard and Exit`).

## Next steps

Congratulations - you've learned how to use the QA Wolf REPL! 🎉

There are a few places you might want to go from here:

- [Learn more about adding assertions](add_assertions) to your tests
- [Use custom element selectors](use_custom_selectors) in your tests
- [Change input values](change_input_values) in your tests
