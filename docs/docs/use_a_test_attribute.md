---
id: use_a_test_attribute
title: 🔍 Use a Test Attribute
---

A best practice is to use test [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes) like `data-qa` or `data-test` to target elements to make your tests robust to changes in your front end code.

In this tutorial, we'll learn how to use a test attribute for the selector. We assume you understand the basics of [creating a test](create_a_test).

## Add test attributes to your application

If you haven't already, you will need to add test attributes to the relevant elements in your application. Don't worry - you don't need to do this all at once. If a test attribute is not included for a test step, QA Wolf will fall back to the [default selector logic](review_test_code#how-the-generated-selector-works) (more on this in a bit).

In this tutorial we'll use the [`data-qa` attribute](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) as our test attribute, but you can use whatever attribute you like (examples: `data-test`, `aria-label`, and `id`). `data-*` attributes allow you to store extra information on your element, and in our case we'll use `data-qa` to label elements in our tests.

Let's say we have a submit button in our application with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button>Submit</button>
```

By default, when running a test QA Wolf's selector logic will look for a button with the "Submit" text. However, if we change this element too much in our front end code, our tests may no longer be able to find it.

To explicity label our element for use in testing, we'll add the `data-qa` attribute with a value of `"submit"`:

```html
<button data-qa="submit">Submit</button>
```

Now even as the text, [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class), and other attributes of our submit button change, the `data-qa` attribute will always label it as the `"submit"` element to use in tests.

## Create a test with a test attribute

Now that at least some of the elements in our test have a `data-qa` attribute, let's create a test that targets the `data-qa` attribute whenever possible.

When creating our tests, QA Wolf looks for attributes from the [`QAW_ATTRIBUTE` environment variable](api#qaw_attribute). The default value of `QAW_ATTRIBUTE` is `data-cy,data-qa,data-test,data-testid`. What this means is that:

- if the element you interact with has a `data-cy`, `data-qa`, `data-test`, or `data-testid` attribute, the generated test code will target that attribute and value combination
- otherwise, the generated test code will use the [default selector logic](review_test_code#element-selectors)

You can change the `QAW_ATTRIBUTE` to a different attribute like `aria-label` if you prefer.

```bash
QAW_ATTRIBUTE=aria-label npx qawolf create www.myawesomesite.com myAwesomeTest
```

In this tutorial, we test a modified version of [TodoMVC](http://todomvc.com/examples/react) where some of the elements have the `data-qa` attribute and some do not. The generated test code in `.qawolf/tests/myAwesomeTest.test.js` looks like this:

```js
const { launch } = require("qawolf");
const selectors = require("../selectors/myFirstTest");

describe("myAwesomeTest", () => {
  let context;

  beforeAll(async () => {
    context = await launch({ url: "http://todomvc.com/examples/react" });
  });

  afterAll(() => context.close());

  it('can type into "What needs to be done?" input', async () => {
    await context.type({ css: "[data-qa='todo-input']" }, "create test!");
  });

  it("can Enter", async () => {
    await context.type({ css: "[data-qa='todo-input']" }, "↓Enter↑Enter");
  });

  it("can click input", async () => {
    await context.click(selectors[2]);
  });

  it('can click "Clear completed" button', async () => {
    await context.click({ css: "[data-qa='clear-completed']" });
  });
});
```

You'll notice that steps 1, 2, and 4 of the test involve elements where the `data-qa` attribute is present. For example, the first element we interacted with (where we typed our todo) has the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML). The `data-qa` attribute is set to `"todo-input"`:

```html
<input
  class="new-todo"
  data-qa="todo-input"
  placeholder="What needs to be done?"
  value=""
/>
```

The corresponding test code specifies the [CSS selector](api#interface-selector) targeting the element with the `data-qa` attribute set to `"todo-input"`:

```js
it('can type into "What needs to be done?" input', async () => {
  await context.type({ css: "[data-qa='todo-input']" }, "create test!");
});
```

Step 3 of the test clicked on the following element, where `data-qa` was NOT present:

```html
<input class="toggle" type="checkbox" />
```

The corresponding test code uses the [default selector logic](review_test_code#element-selectors) since `data-qa` was not present:

```js
it("can click input", async () => {
  await context.click(selectors[2]);
});
```

## Update an existing test

In step 3 of the example test in the previous section, the following element is clicked on:

```html
<input class="toggle" type="checkbox" />
```

Because `data-qa` is not present on that element, the generated test code uses the [default selector logic](review_test_code#element-selectors):

```js
it("can click input", async () => {
  await context.click(selectors[2]);
});
```

Let's say we later update our front end code to include a `data-qa` attribute with the value `"complete-todo"` on that element:

```html
<input class="toggle" data-qa="complete-todo" type="checkbox" />
```

We can update our test code to now target the element with the `data-qa` attribute set to `"complete-todo"`. To do this, let's replace the default selector `selectors[2]` with a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `"[data-qa='complete-todo']"`
:

```js
it("can click input", async () => {
  await context.click({ css: "[data-qa='complete-todo']" });
});
```

Now when we run our test again, it will find that element based on its `data-qa` value! 🎉
