<p align="center"><img src="https://docs.qawolf.com/img/logo_small.png" height="80" /></p>

<h1 align="center">QA Wolf</h1>

<h3 align="center">Create browser tests 10x faster</h3>

<p align="center">QA Wolf is a free and open source library for creating <a href="https://github.com/puppeteer/puppeteer">Puppeteer</a> and <a href="https://jestjs.io">Jest</a> browser tests and running them in CI</p>

<p align="center">
  <a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
  <a href="https://github.com/qawolf/qawolf/actions?query=workflow%3A%22npm+test%22"><img src="https://github.com/qawolf/qawolf/workflows/npm%20test/badge.svg" /></a>
</p>

<p align="center">
    <a href="https://docs.qawolf.com/docs/get_started">🚀 Quickstart</a> |
    <a href="https://docs.qawolf.com/docs/api">📖 API</a> |
    <a href="https://docs.qawolf.com/docs/faq">🧐 FAQ</a> |
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="https://github.com/qawolf/qawolf/projects/4">🗺️ Roadmap</a>
</p>

<br/>

<p>QA Wolf is an open source node library for creating browser tests 10x faster:</p>

<ul>
<li><b>No more boilerplate.</b> Your browser actions are converted to Puppeteer and Jest code.
</li>
<li><b>Built for stability.</b> Avoid flaky tests with <a href="https://docs.qawolf.com/docs/how_it_works#%EF%B8%8F-automatic-waiting">automatic waiting</a> and <a href="https://docs.qawolf.com/docs/how_it_works#-element-selectors">smart element selectors</a>.
</li>
<li><b>Test complex scenarios.</b> Test your application like a user. Use third party sites, multiple windows, and hot keys.
</li>
<li><b>One command CI.</b> Run your tests in CI with one command, on push or on a schedule.
</li>
<li><b>Debug easily.</b> Each test run in CI includes a video, GIF, interactive DOM recording, and detailed logs.
</li>
</ul>
<p>We're working to build a world where browser testing is effortless. We hope you'll join us!</p>

<br/>

## Table of Contents

- [🖥️ Install QA Wolf](#%EF%B8%8F-install-qa-wolf)
- [✅ Create a browser test](#-create-a-browser-test)
- [☁️ Set up CI](#%EF%B8%8F-set-up-ci)
- [🙋 Get Help](#-get-help)
- [📝 License](#-license)
- [🙏 Acknowledgments](#-acknowledgements)

<br/>

## 🖥️ Install QA Wolf

Install QA Wolf as a dev dependency with [`npm`](https://www.npmjs.com):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

<br/>

## ✅ Create a browser test

[Documentation](http://docs.qawolf.com/docs/get_started#-record-a-browser-test)

Create a [Puppeteer](https://github.com/puppeteer/puppeteer) and [Jest](https://jestjs.io/) test:

```bash
npx qawolf record <url> [name]
```

![Create a test](https://storage.googleapis.com/docs.qawolf.com/home/create-test-small.gif)

Run your test:

```bash
npx qawolf test [name]
```

<br/>

## ☁️ Set up CI

[Documentation](https://docs.qawolf.com/docs/set_up_ci)

Watch the [video, gif, and dom artifacts](https://docs.qawolf.com/docs/set_up_ci#-debug) from your CI runs.

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

![Set up CI](https://storage.googleapis.com/docs.qawolf.com/home/github.gif)

Just [ping us](https://gitter.im/qawolf/community) if you want to run [QA Wolf Docker](https://hub.docker.com/r/qawolf/qawolf) somewhere else.

<br/>

## 🙋 Get Help

<p align="left">
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="mailto:jon@qawolf.com">📬 E-mail</a>
</p>

We want QA Wolf to work for you, so please reach out to get help!

<br/>

## 📝 License

QA Wolf is licensed under [BSD-3-Clause](https://github.com/qawolf/qawolf/blob/master/LICENSE.md).

<br/>

## 🙏 Acknowledgements

The DOM Recording artifact is using [@Yuyz0112](https://github.com/Yuyz0112)'s awesome [rrweb](https://github.com/rrweb-io/rrweb) library!
