---
id: faq
title: 🧐 FAQ
---

## Why did we build QA Wolf?

We built QA Wolf to make our lives easier, and we hope you find it useful too. We have experienced the pain of setting up browser tests for consulting clients and previous employers. By generating [editable code](edit_your_code) from a recording, we significantly reduce the time needed to write or maintain tests. We constantly stress test QA Wolf against different sites to get closer to that goal. Please reach out on our [chat](https://gitter.im/qawolf/community) if you have any feedback or requests!

## Why not [some other recorder]?

We found the open source recorders brittle and limited in their functionality. They are brittle because they rely on specific attributes and do not auto-wait for elements/assertions. They are limited in their functionality because they do not configure CI, do not include debugging artifacts (videos, DOM, logs), or do not work for various scenarios (multiple tabs, keyboard shortcuts, etc).

We are philosophically opposed to closed-source test recorders and proprietary test frameworks. We believe that if you put in the work to create your tests, you should own them, be able to edit them as you like, and be able to run them on your own infrastructure.

## Why Puppeteer over Selenium?

We found Puppeteer to be much more stable than Selenium in practice and we're not [the](https://medium.com/coursera-engineering/improving-end-to-end-testing-at-coursera-using-puppeteer-and-jest-5f1bac9cd176) [only](https://news.ycombinator.com/item?id=20505711) [ones](https://news.ycombinator.com/item?id=20506053).

## Why Puppeteer over Cypress?

We think Cypress is really cool! However they [intentionally](https://docs.cypress.io/guides/references/trade-offs.html#Automation-restrictions) built it for sites you control, not third party sites. This limitation, and the [one window](https://docs.cypress.io/guides/references/trade-offs.html#Multiple-tabs) limitation, prevent testing use cases we encounter in the wild (sign in with Twitter, CRM Integration, etc).

Why not stub out those situations? You still can - just edit the generated Puppeteer and Jest test code! However, stubbing requires a time and maintenance investment that we wanted to be able to opt out of. We leave it to you to stub or not stub as you like.

In addition, by running our [@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) code in the browser we get the best of Cypress (fast in the browser) and [Puppeteer](https://pptr.dev/)/[DevTools](https://chromedevtools.github.io/devtools-protocol/) (rich APIs and well-supported DevTools protocol).
