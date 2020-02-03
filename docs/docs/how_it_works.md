---
id: how_it_works
title: ⚙️ How It Works
---

TODOCLEANUP

## Element selectors

You'll notice in the test code above that the [`click`](api#browserclickselector-options) and [`type`](api#browsertypeselector-value-options) methods on [`context`](api#class-browsercontext) take an argument that looks like `selectors[0]`:

```js
it('can type into "What needs to be done?" input', async () => {
  await context.type(selectors[0], "create smoke test!");
});
```

The `selectors` are imported from the `.qawolf/selectors/myFirstTest.json` file:

```js
const selectors = require("../selectors/myFirstTest");
```

The `.qawolf/selectors/myFirstTest.json` file is a [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) file containing an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). The file looks something like this:

```json
[
  {
    "index": 0,
    "html": {
      "ancestors": [
        "<header class=\"header\" data-reactid=\".0.0\"></header>",
        "<div data-reactid=\".0\"></div>"
      ],
      "node": "<input class=\"new-todo\" placeholder=\"What needs to be done?\" value=\"\" data-reactid=\".0.0.1\"/>"
    }
  }
  // ...
]
```

The generated [selector](api#interface-selector) includes the following keys:

- `index`: which step number the selector corresponds to, starting at `0`
- `html`: the [node](https://developer.mozilla.org/en-US/docs/Web/API/Node) that was interacted with, and its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement)

The test code references the generated [selector](api#interface-selector) in each step:

```js
it('can type into "What needs to be done?" input', async () => {
  await context.type(selectors[0], "create smoke test!");
});
```

The most important thing about the selector is that it includes all the information it can about the target element and its two ancestors. The `qawolf` library can therefore find the target element based on multiple attributes. This helps make tests robust to changes in your application as well as dynamic attributes like CSS classes. If a close enough match for the target element is not found, the test will fail.

You can optionally replace the default selector with a custom CSS or text selector (more on this in the [edit code tutorial](edit_test_code#use-custom-selectors)).

The next section goes into detail on how the generated selector works.

## How the generated selector works

When an element contains an attribute specified by [`QAW_ATTRIBUTE`](api#qaw_attribute), a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) for that attribute will be generated. See [🔍 Use a Test Attribute](use_a_test_attribute) for more details.

Otherwise QA Wolf serializes the entire element, its [parent](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement), and parent's parent, to make your tests robust to changes instead of relying on a specific attribute like an xpath to locate elements. The serialized elements are then stored in the selector (`.qawolf/selectors/myFirstTest.json`). QA Wolf uses the [open source `html-parse-stringify` library](https://github.com/HenrikJoreteg/html-parse-stringify) to serialize each element.

When you run a test, QA Wolf goes through the following steps to locate each element ([source code](https://github.com/qawolf/qawolf/blob/master/packages/web/src/find/findHtml.ts)):

1. A list of candidate elements is generated based on the type of action (like `click` or `type`) to take. For example, if the next action is a `type` action, only elements that can accept keyboard input like inputs are considered.
2. Candidate elements are ranked by how closely they match the target element and its two direct ancestors. Certain attributes like text content, `id`, `title`, and `name` are considered indicative of a strong match. Elements that share these "strong match" attributes with the target are ranked highest. All candidates are then ordered by how closely their attributes match those of the target element.
3. If there is a strong match with the target, the test acts on that element. Otherwise, if the similarity between the highest ranked candidate and the target is above a threshold, the test acts on the highest ranked candidate. If no good enough match is found, QA Wolf will keep trying to find a match. The threshold similarity is reduced slowly over time to 75%. In other words, QA Wolf first tries to find a perfect match, but over time it allows a larger amount of divergence between the candidate and target elements.
4. If a matching element is not found within a [specified timeout](api#qaw_find_timeout_ms) (default 30 seconds), the test fails.

If you [replace the generated selector](edit_test_code#use-custom-selectors) with a custom selector, QA Wolf will wait until it finds an element matching that selector. If no match is found before the [timeout](api#qaw_find_timeout_ms), the test fails.

## Automatic waiting

QA Wolf is built to avoid [flaky tests](https://whatis.techtarget.com/definition/flaky-test), so automatic waiting comes out of the box. Automatic waiting allows us to avoid writing custom wait logic or arbitrary sleep statements.

The action methods like [`click`](api#browserclickselector-options) and [`type`](api#browsertypeselector-value-options) on the [`context`](api#class-browsercontext) automatically wait for the target element to appear before moving on. For example, after we click to complete our todo, it takes a bit of time for the "Clear completed" button to appear on the page. In this case, the `qawolf` library will keep looking for the "Clear completed" button until it appears, at which point it will be clicked.

The [`context`](api#class-browsercontext) also automatically waits for network requests to finish or time out. If you [include an assertion](edit_test_code#add-an-assertion) based on one of the [`context` class helper methods](api#class-browsercontext), QA Wolf will automatically wait to get the data you asked for before moving on.

One caveat is that elements may appear on the page before event handlers are attached. By default we [sleep for 1 second](api#qaw_sleep_ms) after an element is found to mitigate this issue. However, you can [edit your test code](edit_test_code) to include custom wait logic instead for these scenarios. [The `waitUntil` helper](api#qawolfwaituntilpredicate-timeoutms-sleepms) will likely be useful here.

## Keyboard events

QA Wolf captures `keydown` and `keyup` events so it can perfectly match the original keystrokes. This allows us to support special keys like `Tab` and `Enter` and hotkeys.

If no special characters are found, the keystrokes are simplified to a plain string for human-readability.

Example:

```js
// original key events
await type(selectors[0], "↓KeyL↑KeyL↓KeyA↓KeyU↑KeyA↓KeyR↑KeyU↑KeyR↓KeyA↑KeyA");

// simplified
await type(selectors[0], "laura");
```

When a special key like `Enter` is pressed, all keyboard events are included in the generated test code:

```js
await context.type(selectors[1], "↓Enter↑Enter");
```
