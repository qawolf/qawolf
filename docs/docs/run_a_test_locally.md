---
id: run_a_test_locally
title: 🏃 Run a Test Locally
---

In the [previous section](create_a_test) we created our first browser test for [TodoMVC](http://todomvc.com/examples/react). We will now run our test locally to make sure that it works.

## Run a test locally

Let's run our test to confirm it works locally. In the command line, run the following command. If applicable, replace `myFirstTest` with your test name.

```bash
npx qawolf test myFirstTest
```

If you provide an incorrect name, you will be asked to choose from a list of your tests.

A Chromium browser will open and the test will run. See the GIF below for an example.

![Run a test locally](https://storage.googleapis.com/docs.qawolf.com/tutorials/run_test.gif)

If you're having trouble running your test, please [chat with us](https://gitter.im/qawolf/community) or [open an issue on GitHub](https://github.com/qawolf/qawolf/issues/new).

To run all of your tests locally, run:

```bash
npx qawolf test
```

## Next steps

Congratulations - you've mastered the basics of creating and running browser tests with QA Wolf! 🎉

There are a few places you can go from here:

- [Learn about your test code](review_test_code)
- [Edit your test code (add assertions, use custom selectors, and more!)](edit_test_code)
- [Run your tests in CI](set_up_ci)
