<h1 align="center">🐺 Delightful Browser Recorder</h1>

<p align="center">
    <a href="https://docs.qawolf.com">📖 Docs</a> |
    <a href="https://docs.qawolf.com/docs/faq">🧐 FAQ</a> |
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="https://github.com/qawolf/qawolf/projects/4">🗺️ Roadmap</a>
</p>

<a align="center" height="200" href="https://qawolf.com"><img src="https://storage.googleapis.com/docs.qawolf.com/home/record-small.gif" alt="QA Wolf" /></a>

<p align="center">
  <a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
  <a href="https://github.com/qawolf/qawolf/actions?query=workflow%3A%22npm+test%22"><img src="https://github.com/qawolf/qawolf/workflows/npm%20test/badge.svg" /></a>
</p>

> QA Wolf is a delightful [open source](https://github.com/qawolf/qawolf) recorder that translates your browser actions into [Puppeteer](https://github.com/puppeteer/puppeteer) and [Jest](https://jestjs.io/) code. It [automatically waits](https://docs.qawolf.com/docs/how_it_works#automatic-waiting) for elements and assertions and builds a [smart element selector](https://docs.qawolf.com/docs/how_it_works#element-selectors) to ensure stability. QA Wolf supports multiple windows, hot keys, and other complex scenarios.

### What can I do?

[**✅ Record a browser test**](#-record-a-browser-test): Test the browser using [Jest](https://jestjs.io/) and [Puppeteer](https://github.com/puppeteer/puppeteer).

[**🤖 Record a browser script**](#-record-a-browser-script): Automate the browser using [Puppeteer](https://github.com/puppeteer/puppeteer).

[**🎥 Set up CI**](#-set-up-ci): Watch the video, gif, and dom artifacts from your CI runs.

## Quick Start

<a href="https://docs.qawolf.com/docs/get_started">📖 Doc</a>

### 🖥️ Install QA Wolf

Install QA Wolf as a dev dependency with [`npm`](https://www.npmjs.com):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

### [✅ Record a browser test](http://docs.qawolf.com/docs/get_started#-record-a-browser-test)

Record your test:

```bash
npx qawolf record <url> [name]
```

Run your test:

```bash
npx qawolf test [name]
```

Run all tests:

```bash
qawolf test
```

### [🤖 Record a browser script](http://docs.qawolf.com/docs/get_started#-record-a-browser-script)

Record your script:

```bash
npx qawolf record --script <url> [name]
```

Run your script:

```bash
node .qawolf/scripts/name.js
```

### 🎥 Set up CI

<a align="center" height="200" href="https://qawolf.com"><img src="https://storage.googleapis.com/docs.qawolf.com/home/debug.gif" alt="QA Wolf" /></a>

Watch the video, gif, and dom artifacts from your CI runs.

[<img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/azure-190760.png" /> Azure](https://docs.qawolf.com/docs/set_up_ci#azure)

```bash
npx qawolf azure
```

[<img align="center" height="20px" src="https://cdn.iconscout.com/icon/free/png-256/circleci-283066.png" /> CircleCI](https://docs.qawolf.com/docs/set_up_ci#circleci)

```bash
npx qawolf circleci
```

[<img align="center" height="20px" src="https://camo.githubusercontent.com/7710b43d0476b6f6d4b4b2865e35c108f69991f3/68747470733a2f2f7777772e69636f6e66696e6465722e636f6d2f646174612f69636f6e732f6f637469636f6e732f313032342f6d61726b2d6769746875622d3235362e706e67" /> GitHub](https://docs.qawolf.com/docs/set_up_ci#github)

```bash
npx qawolf github
```

[🦊 GitLab](https://docs.qawolf.com/docs/set_up_ci#gitlab)

```bash
npx qawolf gitlab
```

QA Wolf will run anywhere that supports Docker. Just [ping us](https://gitter.im/qawolf/community) if you want to run [QA Wolf Docker](https://hub.docker.com/r/qawolf/qawolf) somewhere else.

## Support

<p align="left">
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="mailto:jon@qawolf.com">📬 E-mail</a>
</p>

We want QA Wolf to work for you, so please reach out to get help!

## Acknowledgements

The DOM Recording artifact is using [@Yuyz0112](https://github.com/Yuyz0112)'s awesome [rrweb](https://github.com/rrweb-io/rrweb) library!
