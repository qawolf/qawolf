---
id: contribute
title: 🙋 Contribute
---

QA Wolf is an [open source](https://github.com/qawolf/qawolf) project, and we welcome improvements from the community!

💡If you have an idea for a new feature or enhancement, please [chat with us](https://gitter.im/qawolf/community) or [open an issue](https://github.com/qawolf/qawolf/issues/new) with your proposal!

👀 If you are looking for something to work on, please see our [open issues](https://github.com/qawolf/qawolf/issues) and comment on any that you'd like to tackle.

## Improve the docs

Improving our documentation is a great way to start contributing to QA Wolf. Our docs are also open source and are built with the awesome [Docusaurus](https://v2.docusaurus.io/) library.

To get started, first fork the [`qawolf` repository](https://github.com/qawolf/qawolf). See [GitHub documentation](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) to learn more about forking a repository.

Change directories into the `docs` folder:

```bash
cd qawolf/docs
```

Start the development server:

```bash
# inside qawolf/docs
npm run start
```

You will be able to view the docs at `localhost:3000` (or a different port if `3000` is busy).

Each page in the docs lives in a named Markdown file in the `qawolf/docs/docs` folder. For example, the file with the Markdown for this page is `qawolf/docs/docs/contribute.md`.

Once you've made the changes you'd like, please make a pull request to the [`qawolf` repository](https://github.com/qawolf/qawolf). See [GitHub documentation](https://help.github.com/en/desktop/contributing-to-projects/creating-a-pull-request) to learn more about creating a pull request.

If you have any questions please [chat with us on Gitter](https://gitter.im/qawolf/community)!

## Development environment

QAWolf is organized as a mono-repo of packages using [lerna](https://github.com/lerna/lerna).

Run bootstrap to install, build and link the dependencies. You should re-run this everytime you change a package's dependencies.

```sh
npm run bootstrap
```

Run the the watchers to keep the `/lib` folders up to date.

```sh
cd ./qawolf
npm run watch

cd ./qawolf/packages/web
npm run watch
```

## What are all of these packages?!

[@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) is a JS library that runs inside the browser. It has helpers to auto-wait for elements and assertions, and a Recorder to collect user interaction events.

[@qawolf/browser](https://github.com/qawolf/qawolf/tree/master/packages/browser) is a wrapper around Playwright that injects the `@qawolf/web` library and exposes helpers to use it. It switches to the page of a selector, waits for requests to finish, and manages keyboard interactions.

[@qawolf/build-workflow](https://github.com/qawolf/qawolf/tree/master/packages/build-workflow) converts user interaction events into a workflow of steps to take.

[@qawolf/build-code](https://github.com/qawolf/qawolf/tree/master/packages/build-code) builds a test or script from a workflow.

[@qawolf/screen](https://github.com/qawolf/qawolf/tree/master/packages/screen) creates a display with xvfb and the video and gif artifacts with ffmpeg.

[@qawolf/cli](https://github.com/qawolf/qawolf/tree/master/packages/cli) ties everything together into commands.
