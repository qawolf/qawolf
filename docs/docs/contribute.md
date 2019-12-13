---
id: contribute
title: 🙋 Contribute
---

QA Wolf is an [open source](https://github.com/qawolf/qawolf) project, and we welcome improvements from the community! Please see our [open issues](https://github.com/qawolf/qawolf/issues) and comment on any that you'd like to tackle.

💡If you have an idea for a new feature or enhancement, please [chat with us](https://gitter.im/qawolf/community) or [open an issue](https://github.com/qawolf/qawolf/issues/new) with your proposal!

👀 If you are looking for something to work on, please see our [open issues](https://github.com/qawolf/qawolf/issues) and comment on any that you'd like to tackle.

## Development Environment

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

[@qawolf/browser](https://github.com/qawolf/qawolf/tree/master/packages/browser) is a wrapper around Puppeteer that injects the `@qawolf/web` library and exposes helpers to use it. It switches to the page of a selector, waits for requests to finish, and manages keyboard interactions.

[@qawolf/build-workflow](https://github.com/qawolf/qawolf/tree/master/packages/build-workflow) converts user interaction events into a workflow of steps to take.

[@qawolf/build-code](https://github.com/qawolf/qawolf/tree/master/packages/build-code) builds a test or script from a workflow.

[@qawolf/screen](https://github.com/qawolf/qawolf/tree/master/packages/screen) creates the video and gif artifacts with ffmpeg.

[@qawolf/cli](https://github.com/qawolf/qawolf/tree/master/packages/cli) ties everything together into commands.

[qawolf/qawolf docker](https://github.com/qawolf/qawolf/blob/master/Dockerfile) sets up Puppeteer and ffmpeg as dependencies to run the code and collect artifacts (video, GIF, etc).
