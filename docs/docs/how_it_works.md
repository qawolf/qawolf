---
id: how_it_works
title: ⚙️ How It Works
---

## Overview

**When you [create a test](cli#npx-qawolf-create-url-name)**, a [Puppeteer](https://pptr.dev/) Chromium browser opens with the [@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) library injected. The `Recorder` intercepts your click, type, select, and scroll events to convert into workflow steps later. These events include the html of the target element and it's ancestors which is used to find the element when running the test. [Learn more about element selectors.](review_test_code#element-selectors)

**When you finish creating a test**, the events are converted to a workflow in [@qawolf/build-workflow](https://github.com/qawolf/qawolf/tree/master/packages/build-workflow) and to code in [@qawolf/build-code](https://github.com/qawolf/qawolf/tree/master/packages/build-code).

The code file is created as either:

- a `.qawolf/tests/yourTest.test.js` [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test
- a `.qawolf/scripts/yourScript.js` [Puppeteer](https://pptr.dev/) node script

The second file that is created is `.qawolf/selectors/name.json` which contains the [element selectors](review_test_code#element-selectors).

**When you run the code**, it automatically waits for the elements and assertions using the [`qawolf` api](api), which just extends [Puppeteer](https://pptr.dev/).

**When you run the code [in CI](set_up_ci)**, [debugging artifacts](set_up_ci#-debug) are generated. These include a video, gif, interactive DOM recording, and browser logs.

See [our tutorial on understanding test code](review_test_code) for a deep dive on the generated code. The following sections may be of particular interest:

- [Automatic waiting](review_test_code#automatic-waiting)
- [Element selectors](review_test_code#element-selectors)
- [Keyboard events](review_test_code#keyboard-events)

If you have any additional questions about how QA Wolf works, please [reach out to us](https://gitter.im/qawolf/community)!
