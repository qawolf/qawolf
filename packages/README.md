### What are all of these packages?!

[@qawolf/browser](https://github.com/qawolf/qawolf/tree/master/packages/browser) is a wrapper around Puppeteer that injects the [@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) library and exposes helpers to use it. It switches to the page of a step, waits for requests to finish, and manages keyboard interactions.

[@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) is a JS library that runs inside the browser. It has helpers to auto-wait for elements and assertions, and a Recorder to collect user interaction events.

[@qawolf/build-workflow](https://github.com/qawolf/qawolf/tree/master/packages/build-workflow) converts user interaction events into a workflow of steps to take.

[@qawolf/build-test](https://github.com/qawolf/qawolf/tree/master/packages/build-test) builds a Jest test for a workflow.

[@qawolf/runner](https://github.com/qawolf/qawolf/tree/master/packages/runner) runs workflow steps in the browser (click/type/etc). It uses values from environment variables if they are provided.

[@qawolf/jest-environment](https://github.com/qawolf/qawolf/tree/master/packages/jest-environment) creates a `Browser` and `Runner` when it finds a corresponding workflow file for a test, and exposes globals to the test (Runner.click, Runner.type, currentPage, browser, etc... API documentation coming soon).

[@qawolf/cli](https://github.com/qawolf/qawolf/tree/master/packages/cli) ties everything together into commands.

[qawolf/qawolf docker](https://github.com/qawolf/qawolf/blob/master/Dockerfile) sets up Puppeteer and ffmpeg as dependencies to run tests and collect artifacts (video, GIF, etc).
