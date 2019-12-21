---
id: smoke_tests_with_alerts
title: 🔥 Smoke Tests with Alerts
---

You may have experienced this: someone pushed code to production and now a critical user workflow is broken. Despite your team’s best efforts, the bug slipped through. How could you have caught it before a user did? 😱

In this tutorial, we’ll learn about smoke testing as a line of defense against bugs on production. We’ll set up smoke tests on a website, and build an alerting system that tells us when something isn’t working. Let’s get started!

## What are smoke tests?

Smoke tests are tests that cover the most important functionality of an application. For example, on Netflix the critical user workflows include signing in, searching for a show, and watching a show. The term “smoke test” originated in hardware repair, where a machine would fail the smoke test if it caught on fire when turned on. 🔥

[According to Microsoft](<https://docs.microsoft.com/en-us/previous-versions/ms182613(v=vs.80)?redirectedfrom=MSDN>), “smoke testing is the most cost-effective method for identifying and fixing defects in software” after code reviews. This is because smoke tests are NOT intended to cover every permutation and edge case. Only the most critical functionality is tested to get the most bang for your testing buck. After all, if your application’s sign in flow is broken, does it really matter if the padding on the buttons isn’t quite right?

## Get started

Now let’s create our first smoke test! To get started, either create a new [Node.js](ttps://nodejs.org) project, or change directories into an existing one. To create a new project, run the following in the command line (make sure you have [Node.js installed](https://nodejs.org/en/download/)):

```bash
mkdir smoke-tests
cd smoke-tests
npm init -y
```

[Your code base should now look like this.](https://github.com/qawolf/smoke-tests-example/tree/c3a20db89eee5cf5088ec304b1b8fc69c85d8c27)

Now we need to install the `qawolf` [npm package](https://www.npmjs.com/package/qawolf). `qawolf` is an open source Node.js library that generates [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code from your browser interactions. It also allows you to quickly [set up running your tests on a schedule in various CI providers](set_up_ci).

In the command line, run the following to install `qawolf` as a dev dependency in your project:

```bash
npm i -D qawolf
```

[Your code base should now look like this.](https://github.com/qawolf/smoke-tests-example/tree/862744cb369b41d845321d5c03e60eb1aef42e05)

## Creating a smoke test

Now let's generate our smoke test code. This tutorial will record a test on a [simple todo application](http://todomvc.com/examples/react). Specifically, we'll create a todo item, complete it, and clear completed todos.

When we run the following in the command line, a Chromium browser will open and capture any actions we take (clicking, typing, etc.). You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstSmokeTest` with a different name.

```bash
npx qawolf record http://todomvc.com/examples/react myFirstSmokeTest
```

## Reviewing smoke test code

## Running smoke tests on a schedule

## Setting up alerts on failure

## Next steps
