<h1 align="center">🐺 QA Wolf: Set up browser tests 10x faster</h1>

<p align="center">
    <a href="https://docs.qawolf.com/docs/api">📖 API</a> |
    <a href="https://docs.qawolf.com/docs/faq">🧐 FAQ</a> |
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="https://github.com/qawolf/qawolf/projects/4">🗺️ Roadmap</a>
    <a href="http://badge.fury.io/js/qawolf"></a> |  
<img src="https://badge.fury.io/js/qawolf.svg" alt="npm version"/></a>
</p>

# Quickstart

Install QA Wolf as a dev dependency with [`npm`](https://www.npmjs.com):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

## [✅ Create a browser test from your actions](http://docs.qawolf.com/docs/get_started#-record-a-browser-test)

> QA Wolf supports multiple windows, hot keys, and other complex scenarios. The generated code [automatically waits](https://docs.qawolf.com/docs/how_it_works#-automatic-waiting) for elements and assertions and builds a [smart element selector](https://docs.qawolf.com/docs/how_it_works#-element-selectors) to ensure stability.

Create a [Puppeteer](https://github.com/puppeteer/puppeteer) and [Jest](https://jestjs.io/) test from your actions:

```bash
npx qawolf record <url> [name]
```

![Create a test](https://storage.googleapis.com/docs.qawolf.com/home/create-test-small.gif)

Run your test:

```bash
npx qawolf test [name]
```

## [☁️ Set up CI with one command](https://docs.qawolf.com/docs/set_up_ci)

> Watch the [video, gif, and dom artifacts](https://docs.qawolf.com/docs/set_up_ci#-debug) from your CI runs.

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

Just [ping us](https://gitter.im/qawolf/community) if you want to run [QA Wolf Docker](https://hub.docker.com/r/qawolf/qawolf) somewhere else.

## Support

<p align="left">
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="mailto:jon@qawolf.com">📬 E-mail</a>
</p>

We want QA Wolf to work for you, so please reach out to get help!

## Acknowledgements

The DOM Recording artifact is using [@Yuyz0112](https://github.com/Yuyz0112)'s awesome [rrweb](https://github.com/rrweb-io/rrweb) library!
