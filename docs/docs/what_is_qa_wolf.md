---
id: what_is_qa_wolf
title: 🐺 What Is QA Wolf?
---

:::tip TL;DR

- Use QA Wolf to create browser tests 10x faster
- QA Wolf converts your browser actions to Playwright/Jest test code
- A workflow file to run your tests in CI is created for you

:::

Welcome, thanks for checking out QA Wolf! 😊

QA Wolf is an [open source](https://github.com/qawolf/qawolf) [Node.js library](https://www.npmjs.com/package/qawolf) for creating browser tests 10x faster. It is an opinionated browser testing library that "just works".

For those that are familiar, we aspire to be the [`create-react-app`](https://github.com/facebook/create-react-app) of browser testing.

Curious yet? [Get started here!](install)

![](https://storage.googleapis.com/docs.qawolf.com/website/create.gif)

## How is it 10x faster?

Setting up browser tests is very time consuming. Not only do you need to create the test code, but you also need to figure out how to run your tests in CI. QA Wolf helps you to do each of these things in a fraction of the time.

#### Create Tests Faster

We believe you should be able to create test code without writing boilerplate or having to learn a new framework. As you use your application, your actions are converted to [Playwright](#what-is-playwright) and [Jest](https://jestjs.io/) test code. You can use the generated code as is, or edit it as you go along. The [interactive REPL](use_the_repl) allows you try out assertions and custom code.

#### Set up CI Faster

QA Wolf does the heavy lifting to set up CI. When you set up QA Wolf, you can choose your CI provider and a workflow file to run your tests will be created. Tests will automatically run in parallel to the extent possible, and you can run them on push or on a schedule. Each test run includes a video recording and detailed logs to make debugging easy.

By speeding up test creation and CI setup, QA Wolf enables you to build a browser testing pipeline in minutes. 🧑‍🚀🚀

## Isn't auto generated code flaky?

A common concern, and part of the reason we built QA Wolf, is that auto generated code is unstable. QA Wolf improves stability in a few ways (in addition to allowing you to edit the code as you create your tests).

#### Automatic Waiting

QA Wolf generates [Playwright](#what-is-playwright) code, which automatically waits for elements and for the page to load. Automatic waiting allows you to avoid writing custom wait logic or arbitrary sleep statements.

#### Test Selectors

QA Wolf chooses element selectors wisely. Typically, auto generated code targets elements with very specific selectors like [XPaths](https://developer.mozilla.org/en-US/docs/Web/XPath). These brittle selectors can stop working as your application changes.

A best practice in testing is target elements based on test [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) like `data-qa`. This provides maximum stability even as your application changes. If possible, QA Wolf will target elements based on these test attributes. You can [choose which attributes take priority](configure_qa_wolf#attribute) in the generated code, including attributes like `id` or `aria-label`.

If no specified attribute like `data-qa` is available, QA Wolf chooses the best [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text selector for the target element. It takes into account factors like whether the selector is unique on the page and whether an `id` or `class` is dynamic.

## What is Playwright?

Microsoft's [Playwright](https://github.com/microsoft/playwright) is a Node.js library to automate the [Chromium](https://www.chromium.org/Home), [Firefox](https://www.mozilla.org/en-US/firefox/new), and [WebKit](https://webkit.org) browsers with a single API. QA Wolf generates Playwright code, giving you full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md).

Playwright is maintained by the same team that originally built [Puppeteer](https://github.com/puppeteer/puppeteer) at Google. The additional benefits of Playwright over Puppeteer are cross-browser testing support and more testing-friendly APIs.

## Why Playwright over Selenium?

We found [Playwright](https://github.com/microsoft/playwright) (and its precursor [Puppeteer](https://github.com/puppeteer/puppeteer)) to be more stable than Selenium in practice and we're not [the](https://medium.com/coursera-engineering/improving-end-to-end-testing-at-coursera-using-puppeteer-and-jest-5f1bac9cd176) [only](https://news.ycombinator.com/item?id=20505711) [ones](https://news.ycombinator.com/item?id=20506053).

Playwright offers additional functionality we take advantage of, like [evaluating a script on a new document](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevaluateonnewdocumentpagefunction-args) and [creating a callback to the server](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageexposefunctionname-playwrightfunction). While these are possible to reimplement in Selenium, we want to spend our time creating a better end-to-end experience.

Since Playwright already supports the modern browsers of [Chromium](https://www.chromium.org/Home), [Firefox](https://www.mozilla.org/en-US/firefox/new), and [WebKit](https://webkit.org), we decided to prioritize stability over supporting legacy browsers like [Internet Explorer](https://support.microsoft.com/en-us/help/17621/internet-explorer-downloads).

## Why Playwright over Cypress?

We think Cypress is really cool! However, it was [intentionally](https://docs.cypress.io/guides/references/trade-offs.html#Automation-restrictions) built to only run on sites you control. It was also built to run tests in a single page.

These limitations prevent you from testing things like multiple pages, popup windows, and third party sites. For example, Cypress does not directly support testing scenarios like signing in with Twitter and integrating with a CRM.

Why not stub out those scenarios? You still can - just edit the test code!

However, stubbing requires a time and maintenance investment that we wanted to be able to opt out of. If your goal is to test your application like a real user, stubbing also moves you away from a true end-to-end test. We leave it to you to stub or not stub as you like.

In addition to supporting these complex scenarios, Playwright also supports testing on WebKit browsers.

## Can you support [some other framework/use case]?

You can already edit your code to use any Node.js package or framework.

If you have a particular use case you would like us to support, please [chat](https://gitter.im/qawolf/community) or [email](mailto:jon@qawolf.com) us!

## How do I get help?

We want QA Wolf to work for you, so please reach out if you need help!

Please [chat with us on Gitter](https://gitter.im/qawolf/community), [open an issue on GitHub](https://github.com/qawolf/qawolf/issues/new), or [e-mail us](mailto:jon@qawolf.com) with questions and feedback!
