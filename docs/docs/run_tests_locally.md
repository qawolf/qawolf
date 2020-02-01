---
id: run_tests_locally
title: 🏃 Run Tests Locally
---

In the [previous guide](create_a_test) we created our first browser test for [TodoMVC](http://todomvc.com/examples/react). We will now run our test locally to verify that it works.

## TL;DR

- [Run a specific test](#run-a-test-locally) on Chromium browser:

```bash
npx qawolf test myTestName
```

- [Run all tests](#run-all-tests-locally) on Chromium browser:

```bash
npx qawolf test
```

- Run all tests on all browsers (Chromium, Firefox, and Webkit):

```bash
npx qawolf test --all-browsers
```

## Run a test locally

Let's run our test to confirm it works locally. In the command line, run the following [command](TODOFIXLINK). If applicable, replace `myFirstTest` with your test name.

```bash
npx qawolf test myFirstTest
```

By default, QA Wolf tests run on the [Chromium browser](https://www.chromium.org/Home). After running this command, a Chromium browser will open and the test will run. See the GIF below for an example.

![Run a test locally](https://storage.googleapis.com/docs.qawolf.com/tutorials/run-my-first-test-small.gif)

If you're having trouble running your test, please [chat with us](https://gitter.im/qawolf/community) or [open an issue on GitHub](https://github.com/qawolf/qawolf/issues/new).

## Run all tests locally

To run all of your tests locally, run:

```bash
npx qawolf test
```

By default, QA Wolf tests run on the [Chromium browser](https://www.chromium.org/Home). After running this command, your tests will run in parallel to the extent possible. Each test will run on a separate Chromium browser.

If you prefer to run your tests sequentially, you can use the [`--runInBand` Jest flag](https://jestjs.io/docs/en/cli#--runinband):

```bash
npx qawolf test --runInBand
```

## Testing across browsers

## Next steps

Congratulations - you've mastered the basics of creating and running browser tests with QA Wolf! 🎉

There are a few places you can go from here:

<!-- - [Learn about your test code](review_test_code)
- [Edit your test code (add assertions, use custom selectors, and more!)](edit_test_code)
- [Run your tests in CI](set_up_ci) -->
