---
id: create_a_test
title: 🎨 Create a Test
---

The [previous guide](install) showed you how to set up your environment and install QA Wolf. Now let's create your first browser test!

## TL;DR

- [Create a test](#create-a-test) by running the following in your project directory:

```bash
npx qawolf create https://myawesomesite.com myTestName
```

TODOCLEANUP

## Create a test

First make sure that you are in your project directory and that you have [installed QA Wolf](install):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

When you run the `npx qawolf create` command, a [Chromium](https://www.chromium.org/Home) browser will open and capture your actions such as clicking and typing into inputs. These actions will be converted to [Playwright](https://pptr.dev/) and [Jest](https://jestjs.io/) test code and written to your test file.

In this guide, we create a test for [TodoMVC](http://todomvc.com/examples/react), a simple todo application. Specifically, we create a todo item, complete it, and clear completed todos. You can follow along using your own application if you prefer.

TODOCLEANUP

- Run command
- Open code editor
- Mention REPL and link to doc
- Mention test attribute
- Save

To create your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstTest` with a different name. See the [CLI documentation](cli#npx-qawolf-create-url-name) for more detail.

```bash
npx qawolf create http://todomvc.com/examples/react myFirstTest
```

Inside the Chromium browser, go through the workflow you want to test as a user would. In our example, we'll 1) create a todo item, 2) mark it as complete, and 3) clear completed todos. After you are done, return to the terminal and hit Enter to save your test. See the GIF below for an example.

![Create a test](https://storage.googleapis.com/docs.qawolf.com/tutorials/create-my-first-test-small.gif)

## Review test code

## Next steps

Congratulations - you've just created your first test with QA Wolf! 🎉

We'll [dive deeper into the test code](review_test_code) shortly, but first let's [run our test locally](run_a_test_locally).
