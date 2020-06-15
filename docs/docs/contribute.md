---
id: contribute
title: 🙋 Contribute
---

QA Wolf is an [open source](https://github.com/qawolf/qawolf) project, and we welcome improvements from the community!

💡If you have an idea for a new feature or enhancement, please [chat with us](https://gitter.im/qawolf/community) or [open an issue](https://github.com/qawolf/qawolf/issues/new) with your proposal!

👀 If you are looking for something to work on, please see our [open issues](https://github.com/qawolf/qawolf/issues) and comment on any that you'd like to tackle.

## Improve the docs

Improving our documentation is a great way to start contributing to QA Wolf. Our docs are also open source and are built with the awesome [Docusaurus](https://v2.docusaurus.io/) library.

To get started, first fork the [`qawolf` repository](https://github.com/qawolf/qawolf). See [GitHub documentation](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) to learn how to fork a repository.

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

If you update the Markdown file and save it, your changes will be visible on `localhost:3000`.

Once you've made your changes, make a pull request to the [`qawolf` repository](https://github.com/qawolf/qawolf). See [GitHub documentation](https://help.github.com/en/desktop/contributing-to-projects/creating-a-pull-request) to learn more about creating a pull request.

If you have any questions please [chat with us on Gitter](https://gitter.im/qawolf/community)!

## What are all of these packages?!

We maintain several packages under the [`qawolf` organzation](https://github.com/qawolf). Feel free to contribute to any of them!

- [qawolf](https://github.com/qawolf/qawolf) is a Node.js library for creating Playwright/Jest tests
- [playwright-video](https://github.com/qawolf/playwright-video) saves a video of a Playwright page
