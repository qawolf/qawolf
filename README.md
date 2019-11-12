<h1 align="center">qawolf</h1>

<p align="center">
    <a href="https://docs.qawolf.com">Documentation</a> |
    <a href="https://gitter.im/qawolf/community">Gitter</a> |
    <a href="https://github.com/qawolf/qawolf/projects/4">Roadmap</a>
</p>

<a align="center" href="https://qawolf.com"><img src="https://storage.googleapis.com/docs.qawolf.com/home/record-small.gif" alt="QA Wolf"></a>

<p align="center">
  <a href="https://gitter.im/qawolf/community" alt="Gitter chat"><img src="https://badges.gitter.im/qawolf/gitter.png" /></a>
  <a href="https://github.com/qawolf/qawolf/actions?query=workflow%3A%22npm+test%22"><img src="https://github.com/qawolf/qawolf/workflows/npm%20test/badge.svg" /></a>
  <a href="https://github.com/qawolf/examples" alt="Examples"><img src="https://github.com/qawolf/examples/workflows/qawolf%20examples/badge.svg" /></a>
</p>

## Introduction

🐺[QA Wolf](https://www.qawolf.com/) is an open-source [Node package](https://www.npmjs.com/qawolf) for recording browser tests. It translates your browser actions into [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test code.

#### [Quickstart](https://www.qawolf.com/docs/your_first_test)

**Record Your Tests:** Generate Jest & Puppeteer test code from your browser interactions. QA Wolf supports multiple windows, third party sites, and changing input values with environment variables.

**Set up CI:** Set up a GitHub action to run your tests with `npx qawolf github`. Artifacts for debugging are generated per test.

**Debug with Ease:** Each test run includes a video, gif, interactive DOM recording, and browser logs as artifacts.

**Avoid Flakes:** QA Wolf waits for the next element or assertion to avoid loading flakes. It finds elements with multiple attributes, or a test attribute you specify (like "data-qa"), to avoid selector flakes. We [battle test QA Wolf against public sites](https://github.com/qawolf/examples) on a schedule to keep improving stability.

## Get Started

[Documentation](https://www.qawolf.com/docs/your_first_test)

1. Install QA Wolf as a dev dependency

```bash
npm i -D qawolf
```

2. Record your test

```bash
npx qawolf record <url> [name]
```

3. Run your test!

```bash
npx qawolf test [name]
```

## Set up CI

[Documentation](https://www.qawolf.com/docs/set_up_ci)

Set up CI with [GitHub Actions](https://github.com/features/actions):

```bash
npx qawolf github
```

This will generate a file called `qawolf.yml` in the `.github/workflows` directory at the root of your project. Edit this file as you like!

## Support

We want QA Wolf to work for you, so please reach out to get help!

[Gitter](https://gitter.im/qawolf/community)

[E-mail](mailto:jon@qawolf.com)

## Acknowledgements

The DOM Recording artifact is using [@Yuyz0112](https://github.com/Yuyz0112)'s awesome [rrweb](https://github.com/rrweb-io/rrweb) library!
