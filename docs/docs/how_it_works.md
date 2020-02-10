---
id: how_it_works
title: ⚙️ How It Works
---

This guide goes into more detail on how QA Wolf works. Specifically, it covers [automatic waiting](#automatic-waiting) and [element selectors](#element-selectors).

## Automatic waiting

QA Wolf is built to avoid [flaky tests](https://whatis.techtarget.com/definition/flaky-test), so automatic waiting comes out of the box. Automatic waiting allows us to avoid writing custom wait logic or arbitrary sleep statements.

The action methods like [`click`](api/browser_context/click) and [`type`](api/browser_context/type) on the `browser` automatically wait for the target element to appear before moving on. In [TodoMVC](http://todomvc.com/examples/react), after we click to complete our todo it takes a bit of time for the "Clear completed" button to appear on the page. In this case, the `qawolf` library will keep looking for the "Clear completed" button until it appears, at which point it will be clicked.

The `browser` also automatically waits for network requests to finish or time out. If you [include an assertion](add_assertions) using one of the `browser` helper methods like [`hasText`](api/browser_context/has_text), QA Wolf will automatically wait to get the data you asked for before moving on.

One caveat is that elements may appear on the page before event handlers are attached. By default we [sleep for 1 second](api/environment_variables#qaw_sleep_ms) after an element is found to mitigate this issue. However, you can edit your test code to include custom wait logic instead for these scenarios. [Playwright's `page.waitFor` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagewaitforselectororfunctionortimeout-options-args) will likely be useful here.

## Element selectors

You'll notice in your test code above that the [`click`](api/browser_context/click) and [`type`](api/browser_context/type) methods on `browser` take an argument that looks like `selectors[0]`:

```js
it('can type into "What needs to be done?" input', async () => {
  await browser.type(selectors[0], "create test!");
});
```

The `selectors` are imported from the `.qawolf/selectors/myTestName.json` file:

```js
const selectors = require("../selectors/myTestName");
```

The `.qawolf/selectors/myTestName.json` file is a [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) file containing an [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) of [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). The file looks something like this:

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

The generated selector includes the following keys:

- `index`: which step number the selector corresponds to, starting at `0`
- `html`: the [node](https://developer.mozilla.org/en-US/docs/Web/API/Node) that was interacted with, and its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement)

The test code references the generated selector in each step:

```js
it('can type into "What needs to be done?" input', async () => {
  await browser.type(selectors[0], "create test!");
});
```

The most important thing about the selector is that it includes all the information it can about the target element and its two ancestors. The `qawolf` library can therefore find the target element based on multiple attributes. This helps make tests robust to changes in your application as well as dynamic attributes like CSS classes. If a close enough match for the target element is not found, the test will fail.

You can optionally replace the default selector with a custom CSS or text selector (more on this in the [use custom selectors guide](use_custom_selectors)).

The next section goes into detail on how the generated selector works.

## How the generated selector works

When an element contains an attribute specified by [`QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute), a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) for that attribute will be generated.

Otherwise QA Wolf serializes the entire element, its [parent](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement), and parent's parent. This makes your tests robust to changes instead of relying on a specific attribute like an XPath to locate elements. The serialized elements are then stored in the selectors file (`.qawolf/selectors/myTestName.json`). QA Wolf uses the [open source `html-parse-stringify` library](https://github.com/HenrikJoreteg/html-parse-stringify) to serialize each element.

When you run a test, QA Wolf goes through the following steps to locate each element ([source code](https://github.com/qawolf/qawolf/blob/master/packages/web/src/find/findHtml.ts)):

1. A list of candidate elements is generated based on the type of action (like `click` or `type`) to take. For example, if the next action is a `type` action, only elements that can accept keyboard input like inputs are considered.
2. Candidate elements are ranked by how closely they match the target element and its two direct ancestors. Certain attributes like text content, `id`, `title`, and `name` are considered indicative of a strong match. Elements that share these "strong match" attributes with the target are ranked highest. All candidates are then ordered by how closely their attributes match those of the target element.
3. If there is a strong match with the target, the test acts on that element. Otherwise, if the similarity between the highest ranked candidate and the target is above a threshold, the test acts on the highest ranked candidate. If no good enough match is found, QA Wolf will keep trying to find a match. The threshold similarity is reduced slowly over time to 75%. In other words, QA Wolf first tries to find a perfect match, but over time it allows a larger amount of divergence between the candidate and target elements.
4. If a matching element is not found within a [specified timeout](api/environment_variables#qaw_timeout_ms) (default 30 seconds), the test fails.

If you [replace the generated selector](use_custom_selectors#edit-generated-selectors) with a custom selector, QA Wolf will wait until it finds an element matching that selector. If no match is found before the [timeout](api/environment_variables#qaw_timeout_ms) , the test fails.
