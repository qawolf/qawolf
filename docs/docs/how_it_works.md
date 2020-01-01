---
id: how_it_works
title: ⚙️ How It Works
---

## Overview

**When you run [record](cli#npx-qawolf-record-url-name)**, a [Puppeteer](https://pptr.dev/) Chromium browser opens with the [@qawolf/web](https://github.com/qawolf/qawolf/tree/master/packages/web) library injected. The `Recorder` intercepts your click, type, select, and scroll events to convert into workflow steps later. These events include the html of the target element and it's ancestors which is used to find the element when running the test. [Learn more about element selectors.](#-element-selectors)

**When you finish recording**, the events are converted to a workflow in [@qawolf/build-workflow](https://github.com/qawolf/qawolf/tree/master/packages/build-workflow) and to code in [@qawolf/build-code](https://github.com/qawolf/qawolf/tree/master/packages/build-code).

The code file is created as either:

- a `.qawolf/tests/yourTest.test.js` [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io/) test
- a `.qawolf/scripts/yourScript.js` [Puppeteer](https://pptr.dev/) node script

The second file that is created is `.qawolf/selectors/name.json` which contains the [element selectors](#-element-selectors).

**When you run the code**, it automatically waits for the elements and assertions using the [`qawolf` api](api), which just extends [Puppeteer](https://pptr.dev/).

**When you run the code [in CI](set_up_ci)**, [debugging artifacts](set_up_ci#-debug) are generated. These include a video, gif, interactive DOM recording, and browser logs.

If you have any additional questions about how QA Wolf works, please [reach out to us](https://gitter.im/qawolf/community)!

### ⏱️ Automatic Waiting

QA Wolf uses automatic waiting to dramatically improve stability. Specifically, it automatically waits for network requests to finish or time out, and elements and assertions to appear before proceeding.

QA Wolf waits to find a good match for the [target element](#-element-selectors) before proceeding. This removes the need for you to write custom waiting logic or sleep statements in your tests. If you include an assertion using [one of our helper methods](api#helpers), QA Wolf will also automatically wait to get the data you asked for before moving on.

One caveat is that elements may appear on the page before event handlers are attached. By default we [sleep for 1 second](api#qaw_sleep_ms) after an element is found to avoid this issue. However you can [edit your test code](edit_your_code) to include custom wait logic instead for these scenarios. [The `waitUntil` helper](api#qawolfwaituntilpredicate-timeoutms-sleepms) will likely be useful here.

### 🔍 Element Selectors

Rather than rely on one specific attribute like an xpath to locate elements, QA Wolf serializes the entire element, its [parent](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement), and parent's parent, to make your tests robust to changes. You can also [specify a data attribute](api#qaw_data_attribute) like `data-qa` to use instead of the default selector logic, or [replace the generated selector](edit_your_code#custom-element-selectors) with a [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text selector.

The serialized elements are then stored in the selector (`.qawolf/selectors/name.json`). QA Wolf uses the [open source `html-parse-stringify` library](https://github.com/HenrikJoreteg/html-parse-stringify) to serialize each element.

When you run a test, QA Wolf goes through the following steps to locate each element ([source code](https://github.com/qawolf/qawolf/blob/master/packages/web/src/find/findHtml.ts)):

1. A list of candidate elements is generated based on the type of action (click, type, etc) to take. For example, if the next action is a type action, only elements that can accept keyboard input like inputs are considered. If you [specified a data attribute](api#qaw_data_attribute) and the target element has that data attribute, only elements with a matching attribute (like `data-qa="my-input"`) are considered.
2. Candidate elements are ranked by how closely they match the target element and its two direct ancestors. Certain attributes like text content, `id`, `title`, and `name` are considered indicative of a strong match. Elements that share these "strong match" attributes with the target are ranked highest. All candidates are then ordered by how closely their attributes match those of the target element.
3. If there is a strong match with the target, the test acts on that element. Otherwise, if the similarity between the highest ranked candidate and the target is above a threshold, the test acts on the highest ranked candidate. If no good enough match is found, QA Wolf will keep trying to find a match. The threshold similarity is reduced slowly over time to 75%. In other words, QA Wolf first tries to find a perfect match, but over time it allows a larger amount of divergence between the candidate and target elements.
4. If a matching element is not found within a [specified timeout](api#qaw_find_timeout_ms) (default 30 seconds), the test fails.

If you [replace the generated selector](edit_your_code#custom-element-selectors) with a custom selector, QA Wolf will wait until it finds an element matching that selector. If no match is found before the [timeout](api#qaw_find_timeout_ms), the test fails.

If you have [specified a data attribute](api#qaw_data_attribute) like `data-qa`, QA Wolf will only proceed when an element with the matching data value (for example, `data-qa="my-input"`) is found. You do not need to include the data attribute on every element in your workflow. If it is included, QA Wolf will only proceed if an element with that attribute is found. Otherwise, it will use the default selector logic.

### ⌨️ Keyboard Events

QA Wolf captures `keydown` and `keyup` events so it can perfectly match the original keystrokes. This allows us to support special keys like `Tab` and `Enter` and hotkeys.

If no special characters are found, the keystrokes are simplified to a plain string for human-readability.

Example:

```js
// original key events
await type(selectors[0], "↓KeyL↑KeyL↓KeyA↓KeyU↑KeyA↓KeyR↑KeyU↑KeyR↓KeyA↑KeyA");

// simplified
await type(selectors[0], "laura");
```
