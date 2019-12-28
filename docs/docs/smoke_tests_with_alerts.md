---
id: smoke_tests_with_alerts
title: 🔥 Smoke Tests with Alerts
---

You may have experienced this: someone pushed code to production and now a critical user workflow is broken. Despite your team’s best efforts, the bug slipped through. How could you have caught it before a user did? 😱

In this tutorial, we’ll learn about smoke testing as a line of defense against bugs on production. We’ll set up smoke tests on a website, and build an alerting system that tells us when something isn’t working. Let’s get started!

## What are smoke tests?

Smoke tests are tests that cover the most important functionality of an application. For example, on Netflix the critical user workflows include signing in, searching for a show, and watching a show. The term “smoke test” originated in hardware repair, where a machine would fail the smoke test if it caught on fire when turned on. 🔥

[According to Microsoft](<https://docs.microsoft.com/en-us/previous-versions/ms182613(v=vs.80)?redirectedfrom=MSDN>), “smoke testing is the most cost-effective method for identifying and fixing defects in software” after code reviews. This is because smoke tests are **not** intended to cover every permutation and edge case. Instead, smoke tests verify that the critical functionality isn't broken to the point where further testing would be unnecessary.

The book [<i>Lessons Learned in Software Testing</i>](https://www.oreilly.com/library/view/lessons-learned-in/9780471081128/) summarizes it well: "smoke tests broadly cover product features in a limited time...if key features don't work or if key bugs haven't yet been fixed, your team won't waste further time installing or testing."

## Get started

Now let’s create our first smoke test! First, make sure that you have [Node.js installed](https://nodejs.org/en/download/). To get started, either create a new [Node.js](ttps://nodejs.org) project, or change directories into an existing one.

To create a new project, run the following in the command line:

```bash
mkdir smoke-tests
cd smoke-tests
npm init -y
```

You can follow along in this example GitHub repository. [Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/f027d2d46e890137dcdbb20f12896422a6849a4d)

Now we need to install the `qawolf` [npm package](https://www.npmjs.com/package/qawolf). `qawolf` is an open source Node.js library that generates [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code from your browser interactions. It also allows you to quickly [set up running your tests on a schedule in various CI providers](set_up_ci).

In the command line, run the following to install `qawolf` as a dev dependency in your project:

```bash
npm i -D qawolf
```

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/5e6e96fdf26514d8d3f589b555dbf48d9af51b6d)

## Create a smoke test

Now let's create our first smoke test. In this tutorial, we'll smoke test  [TodoMVC](http://todomvc.com/examples/react), a simple todo application. Specifically, we'll create a todo item, complete it, and clear completed todos.

When we run the `npx qawolf record` command, a [Chromium](https://www.chromium.org/Home) browser will open and capture our actions such as clicks and typing into inputs. These actions will then be converted to [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code (more on this in a bit).

To record your test, run the following in the command line. You can optionally replace `http://todomvc.com/examples/react` with a different URL, and `myFirstSmokeTest` with a different name.

```bash
npx qawolf record http://todomvc.com/examples/react myFirstSmokeTest
```

Inside the Chromium browser, go through the workflow you want to test as a user would. In our example, we'll 1) create a todo item, 2) mark it as complete, and 3) clear completed todos. After you are done, return to the terminal and hit Enter to save your test. See the video below for an illustration.

TODO: INSERT VIDEO

[Your code base should now look like this.](https://github.com/qawolf/tutorials-smoke-tests/tree/b54bd80b7614dabbde186c59cd1db4896292772e) In the next section, we'll dive deeper into the test code.

## Review smoke test code

Feel free to create additional smoke tests before moving on!

## Run smoke tests on a schedule

## Set up alerts on failure

## Next steps
