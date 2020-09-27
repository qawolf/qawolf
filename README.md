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

## 🐺 What is QA Wolf?

QA Wolf is a Node.js library for creating browser tests. Run one command (`npm init qawolf@latest` or `yarn create qawolf`) to configure your project and set up CI.

- **Skip writing boilerplate:** Your browser actions are converted to [Playwright](https://github.com/microsoft/playwright)/[Jest](https://jestjs.io) code.
- **Create stable tests:** Your tests automatically wait for elements. Element selectors use test attributes when possible, and CSS/text otherwise.
- **Edit your tests:** Edit your code as it is created and add steps to existing tests. Re-run your tests automatically with watch mode.
- **Run tests in CI:** A workflow file for your CI provider is automatically created for you.
- **Debug with ease:** Each test run includes a video and browser logs.

<br/>

## 🖥️ Install

[Documentation](https://docs.qawolf.com/docs/install)

<br />

Set up your project for browser tests:

```bash
cd /my/awesome/project
npm init qawolf@latest
# or yarn create qawolf
```

Configure your test directory and CI provider:

```
? rootDir: Directory to create tests in (.qawolf)

? Set up CI with GitHub Actions? (y/N)
```

This will install `qawolf`, `jest` and `playwright` as dev dependencies and create a [CI workflow file](https://docs.qawolf.com/docs/run_tests_in_ci) to:

- 🐎 Run tests in parallel
- 📹 Record a video of each test
- 📄 Capture browser logs

<br/>

## 🎨 Create a test

[Documentation](https://docs.qawolf.com/docs/create_a_test)

<br />

```bash
npx qawolf create [url] [name]
```

💪 Convert your actions into [Playwright](https://github.com/microsoft/playwright) code:

| Action                                                       | Status | Example                                                                    |
| ------------------------------------------------------------ | :----: | -------------------------------------------------------------------------- |
| Click                                                        |   ✅   | `page.click('#login')`                                                     |
| Type                                                         |   ✅   | `page.fill('.username', 'spirit@qawolf.com')`                              |
| Scroll                                                       |   ✅   | `qawolf.scroll(page, 'html', { x: 0, y: 200 })`                            |
| Select                                                       |   ✅   | `page.selectOption('.ice_cream', 'chocolate')`                             |
| Paste                                                        |   ✅   | `page.fill('password', 'pasted')`                                          |
| Reload                                                       |   ✅   | `page.reload()`                                                            |
| Replace text                                                 |   ✅   | `page.fill('.username', 'username')`                                       |
| Go back                                                      |   ✅   | `page.goBack()`                                                            |
| Use iframes                                                  |   ✅   | `(await page.waitForSelector("#storybook-preview-iframe")).contentFrame()` |
| Use multiple tabs                                            |   ✅   | `context.newPage()`                                                        |
| Use a popup                                                  |   ✅   | `qawolf.waitForPage(context, 1)`                                           |
| Use a test attribute                                         |   ✅   | `page.click("[data-qa='submit']")`                                         |
| Use a test attribute on an ancestor                          |   ✅   | `page.click("[data-qa='radio'] [value='cat']")`                            |
| [Drag and drop](https://github.com/qawolf/qawolf/issues/315) |   🗺️   | Coming soon                                                                |
| [File upload](https://github.com/qawolf/qawolf/issues/331)   |   🗺️   | Coming soon                                                                |

As your test is created:

- ✏️ Edit the code as you like
- 🖥️ <a href="https://docs.qawolf.com/docs/use_the_repl">Use the REPL</a> to try out commands

<br/>

## ✅ Run your tests

[Documentation](https://docs.qawolf.com/docs/run_tests_locally)

<br />

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

On all browsers:

```bash
npx qawolf test --all-browsers [name]
```

<br/>

## 🙋 Get help

We want QA Wolf to work for you, so please reach out to get help!

If you have a feature request or feedback, please [open an issue](https://github.com/qawolf/qawolf/issues/new) or [chat with us](https://gitter.im/qawolf/community).

<br/>

## 📝 License

QA Wolf is licensed under [BSD-3-Clause](https://github.com/qawolf/qawolf/blob/main/LICENSE.md).
