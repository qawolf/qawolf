---
id: create_a_test
title: ✅ Create a Test
---

In the [previous section](get_started), we set up our development environment and installed QA Wolf. Now let's create our first browser test!

In this tutorial, we'll create a test for [TodoMVC](http://todomvc.com/examples/react), a simple todo application. Specifically, we'll create a todo item, complete it, and clear completed todos.

## Create a test

First make sure that you are in your project directory and that you have [QA Wolf installed](get_started#install-qa-wolf):

```bash
cd my-awesome-project
npm install --save-dev qawolf
```

When we run the `npx qawolf create` command, a [Chromium](https://www.chromium.org/Home) browser will open and capture our actions such as clicks and typing into inputs. These actions will then be converted to [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code (more on this in the [review code tutorial](review_test_code)).

To create your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstTest` with a different name. See the [CLI documentation](cli#npx-qawolf-create-url-name) for more detail.

```bash
npx qawolf create http://todomvc.com/examples/react myFirstTest
```

Inside the Chromium browser, go through the workflow you want to test as a user would. In our example, we'll 1) create a todo item, 2) mark it as complete, and 3) clear completed todos. After you are done, return to the terminal and hit Enter to save your test. See the GIF below for an example.

![Create a test](https://storage.googleapis.com/docs.qawolf.com/tutorials/create-my-first-test-small.gif)

## Next steps

Congratulations - you've just created your first test with QA Wolf! 🎉

We'll [dive deeper into the test code](review_test_code) shortly, but first let's [run our test locally](run_a_test_locally).
