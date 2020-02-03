---
id: what_is_qa_wolf
title: 🐺 What Is QA Wolf?
---

## Overview

Welcome, thanks for checking out QA Wolf! 😊

QA Wolf is an [open source](https://github.com/qawolf/qawolf) [Node.js library](https://www.npmjs.com/package/qawolf) for creating browser tests 10x faster.

Our goal is to provide an out of the box, opinionated solution to create browser tests and run them in CI. In other words, we are building the zero configuration browser testing library that "just works."

A big part of "just works" is allowing you to test your application like a real user. This includes supporting multiple windows, third party sites, and hot keys.

For those that are familiar, we aspire to be the [`create-react-app`](https://github.com/facebook/create-react-app) of browser testing.

## How is it 10x faster?

In our experience as developers, setting up browser tests is very time consuming. Not only do you need to create the test code, but you also need to figure out how to run your tests in CI. QA Wolf helps you to do each of these things in a fraction of the time.

We believe you should be able to create test code without writing boilerplate or having to learn a new framework. As you use your application, your actions are converted to [Playwright](#what-is-playwright) and [Jest](https://jestjs.io/) test code. You can use the generated code as is, or edit it as you go along. The [interactive REPL](TODOFIXLINK) allows you try out assertions and custom code.

QA Wolf also does the heavy lifting when it comes to setting up CI. With one command, a workflow file is created to run your tests in your CI provider. Tests will automatically run in parallel to the extent possible, and you can run them on push or on a schedule. Each test run also includes a video recording and detailed logs to make debugging easy.

By speeding up test creation and CI setup, QA Wolf enables you to build a browser testing pipeline in minutes. 🚀🧑‍🚀

## Isn't auto generated code flaky?

A common concern, and part of the reason we built QA Wolf, is that auto generated code is unstable.

QA Wolf improves stability in a few ways. First, it automatically waits for elements, outstanding network requests, and assertions before moving on.

QA Wolf also chooses element selectors wisely. Typically, auto generated code targets elements with very specific selectors like [XPaths](https://developer.mozilla.org/en-US/docs/Web/XPath). As your application changes, these brittle selectors can stop working.

A best practice in testing is target elements based on test [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) like `data-qa`. This provides maximum stability even as your application changes. If possible, QA Wolf will target elements based on these test attributes. You can [choose which element attributes are used](TODOFIXLINK) in the generated code, including attributes like `id` or `aria-label`.

If the target attribute is not available, QA Wolf will select elements using multiple attributes to improve stability. QA Wolf stores all the attributes of the target element and its two [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement), and uses that to find a close enough match when running your tests.

## Why not [some other recorder]?

We found the open source recorders brittle and limited in their functionality. They are brittle because they rely on specific attributes and do not automatically wait for elements and assertions. They are limited in their functionality because they do not configure CI, do not include debugging artifacts, or do not work for various scenarios (for example, multiple tabs and keyboard shortcuts).

We are philosophically opposed to closed source test recorders and proprietary test frameworks. We believe that if you put in the work to create your tests, you should own them, be able to edit them as you like, and be able to run them on your own infrastructure.

## What is Playwright?

Microsoft's [Playwright](https://github.com/microsoft/playwright) is a Node.js library to automate the [Chromium](https://www.chromium.org/Home), [Firefox](https://www.mozilla.org/en-US/firefox/new), and [WebKit](https://webkit.org) browsers with a single API. QA Wolf is built on top of Playwright, and your generated test code has full access to the [Playwright API](https://github.com/microsoft/playwright/blob/master/docs/api.md).

Playwright is the successor to [Puppeteer](https://github.com/puppeteer/puppeteer), and is maintained by the same team that originally built Puppeteer at Google. The main additional benefits of Playwright are the ability to test across browsers and more testing-friendly APIs.

## Why Playwright over Selenium?

We found [Playwright](https://github.com/microsoft/playwright) (and its precursor [Puppeteer](https://github.com/puppeteer/puppeteer)) to be more stable than Selenium in practice and we're not [the](https://medium.com/coursera-engineering/improving-end-to-end-testing-at-coursera-using-puppeteer-and-jest-5f1bac9cd176) [only](https://news.ycombinator.com/item?id=20505711) [ones](https://news.ycombinator.com/item?id=20506053).

Playwright offers additional functionality we take advantage of, like [evaluating a script on a new document](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevaluateonnewdocumentpagefunction-args) and [creating a callback to the server](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageexposefunctionname-playwrightfunction). While these are possible to reimplement, we want to spend our time creating a better end-to-end experience.

Since Playwright already supports the modern browsers of [Chromium](https://www.chromium.org/Home), [Firefox](https://www.mozilla.org/en-US/firefox/new), and [WebKit](https://webkit.org), we decided to prioritize stability over supporting legacy browsers like [Internet Explorer](https://support.microsoft.com/en-us/help/17621/internet-explorer-downloads).

## Why Playwright over Cypress?

We think Cypress is really cool! However they [intentionally](https://docs.cypress.io/guides/references/trade-offs.html#Automation-restrictions) built it for sites you control, not third party sites. This limitation prevents scripting third party sites, a [major feature](TODOFIXLINK) of QA Wolf.

This, combined with the [one window](https://docs.cypress.io/guides/references/trade-offs.html#Multiple-tabs) limitation, prevents testing use cases we encounter in the wild like signing in with Twitter and integrating with a CRM.

Why not stub out those situations? You still can - just edit the test code! However, stubbing requires a time and maintenance investment that we wanted to be able to opt out of. We leave it to you to stub or not stub as you like.

Playwright also supports running tests on Firefox and WebKit in addition to Chrome flavored browsers.

By running our [@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) code in the browser we get the best of Cypress (fast in the browser) and [Playwright](https://pptr.dev/)/[DevTools](https://chromedevtools.github.io/devtools-protocol/) (rich APIs and well-supported DevTools protocol).

## Can you support [some other framework]?

You can already edit your code to use any node package or framework.

In terms of generating browser code for a framework other than [Playwright](https://github.com/microsoft/playwright), or a testing framework other than [Jest](https://jestjs.io/), we would consider it to create a better experience for the community. If you have a framework you'd like us to support, please [chat](https://gitter.im/qawolf/community) or [email](mailto:jon@qawolf.com) us!

## How do I get help?

We want QA Wolf to work for you, so please reach out if you need help!

Please [chat with us on Gitter](https://gitter.im/qawolf/community), [open an issue on GitHub](https://github.com/qawolf/qawolf/issues/new), or [e-mail us](mailto:jon@qawolf.com) with questions and feedback!
