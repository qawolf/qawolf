<p align="center"><img src="https://docs.qawolf.com/img/logo_small.png" height="80" /></p>

<h1 align="center">QA Wolf</h1>

<h3 align="center">Create browser tests 10x faster</h3>

<p align="center">Free and open source library to create <a href="https://github.com/microsoft/playwright">Playwright</a>/<a href="https://jestjs.io">Jest</a> browser tests and run them in CI</p>

<p align="center">
<a align="center" href="https://twitter.com/intent/tweet?text=%F0%9F%90%BA+QA+Wolf%3A+Create+browser+tests+10x+faster&url=https%3A%2F%2Fgithub.com%2Fqawolf%2Fqawolf"><img src="https://img.shields.io/twitter/url/https/github.com/tterb/hyde.svg?style=social" alt="tweet" /></a>
  <a href="http://badge.fury.io/js/qawolf"><img src="https://badge.fury.io/js/qawolf.svg" alt="npm version" /></a>
  <img src="https://github.com/qawolf/qawolf/workflows/QA%20Wolf%20Linux%20Tests/badge.svg" />
  <img src="https://github.com/qawolf/qawolf/workflows/QA%20Wolf%20Windows%20Tests/badge.svg" />
</p>

<p align="center">
    <a href="https://docs.qawolf.com/docs/install">🚀 Get Started</a> |
    <a href="https://docs.qawolf.com/docs/api/table_of_contents">📖 API</a> |
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="https://github.com/qawolf/qawolf/projects/4">🗺️ Roadmap</a>
</p>

<img src="https://storage.googleapis.com/docs.qawolf.com/website/create.gif">

<br/>

## 🖥️ Install

[Documentation](http://docs.qawolf.com/docs/install)

Set up browser tests in your project with one command:

```bash
cd /my/awesome/project
npm init qawolf
# or yarn create qawolf
```

This will install `qawolf`, `jest` and `playwright` as dev dependencies.

You can choose to run your tests in CI:

```
? Choose CI Provider (Use arrow keys)
  Azure DevOps
  Bitbucket Pipelines
  CircleCI
❯ GitHub Actions
  GitLab CI/CD
  Jenkins
  Skip CI setup
```

A workflow file will be created for your CI provider to:

- 🐎 Run tests in parallel
- 📹 Record a video of each test
- 📄 Capture browser logs

## 🎨 Create a test

[Documentation](http://docs.qawolf.com/docs/create_a_test)

```bash
npx qawolf create url [name]
```

💪 Convert your actions into [Playwright](https://github.com/microsoft/playwright) code:

| Action                                                       | Status | Example                                                    |
| ------------------------------------------------------------ | :----: | ---------------------------------------------------------- |
| Click                                                        |   ✅   | `page.click(selectors['0_submit'])`                        |
| Type                                                         |   ✅   | `page.type(selectors['0_username'], 'username')`           |
| Scroll                                                       |   ✅   | `qawolf.scroll(page, 'html', { x: 0, y: 200 })`            |
| Select                                                       |   ✅   | `page.selectOption(selectors['0_ice_cream'], 'chocolate')` |
| Replace text                                                 |   ✅   | `page.fill(selectors['0_username'], 'username')`           |
| Paste                                                        |   ✅   | `page.type(selectors['password'], 'pasted')`               |
| Use a test attribute                                         |   ✅   | `page.click("[data-qa='submit']")`                         |
| Use a test attribute on an ancestor                          |   ✅   | `page.click("[data-qa='radio'] [value='cat']")`            |
| Use multiple pages/tabs                                      |   ✅   | `qawolf.waitForPage(page.context(), 1)`                    |
| [Iframes](https://github.com/qawolf/qawolf/issues/279)       |   🗺️   | Coming soon                                                |
| [Drag and drop](https://github.com/qawolf/qawolf/issues/315) |   🗺️   | Coming soon                                                |
| [File upload](https://github.com/qawolf/qawolf/issues/331)   |   🗺️   | Coming soon                                                |
| [Back button](https://github.com/qawolf/qawolf/issues/438)   |   🗺️   | Coming soon                                                |

As your test is created:

- ✏️ Edit test code as you like
- 🖥️ <a href="https://docs.qawolf.com/docs/use_the_repl">Use the REPL</a> to try out commands

<br/>

<br/>

## ✅ Run your tests:

[Documentation](http://docs.qawolf.com/docs/run_tests_locally)

On Chromium:

```bash
npx qawolf test [name]
```

On Firefox:

```bash
npx qawolf test --firefox [name]
```

On Webkit:

```bash
npx qawolf test --webkit [name]
```

On all arowsers:

```bash
npx qawolf test --all-browsers [name]
```

<br/>

## 🙋 Get help

If you have a feature request or feedback, please [open an issue](https://github.com/qawolf/qawolf/issues/new) or chat with us!

<p align="left">
    <a href="https://gitter.im/qawolf/community">👋 Chat</a> |
    <a href="mailto:jon@qawolf.com">📬 E-mail</a>
</p>

We want QA Wolf to work for you, so please reach out to get help!

<br/>

## 📝 License

QA Wolf is licensed under [BSD-3-Clause](https://github.com/qawolf/qawolf/blob/master/LICENSE.md).
