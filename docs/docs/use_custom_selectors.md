---
id: use_custom_selectors
title: 🔍 Use Custom Selectors
---

In this guide, we explain how QA Wolf generates element selectors and how you can edit these selectors. We assume you know how to [create a test](create_a_test).

## TL;DR

- [Element selectors in generated code](#selectors-overview) use attributes specified by [`QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute) if possible, and multiple attributes otherwise:

```js
it('can click "Submit" button', async () => {
  // if 1) data-qa exists on element and 2) QAW_ATTRIBUTE includes data-qa
  await browser.click({ css: "[data-qa='submit']" });
  // otherwise selector object captures all attributes of element
  await browser.click(selectors[0]);
});
```

- You can [edit the generated selectors](#edit-generated-selectors) to target elements based on [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text content:

```js
it('can click "Submit" button', async () => {
  // change this
  await browser.click(selectors[0]);
  // to this (CSS selector)
  await browser.click({ css: "#submit" });
  // or this (text selector)
  await browser.click({ text: "Submit" });
});
```

- To use test attributes like `data-qa`, [update your application code](#add-test-attributes-to-application-code) if needed

## Selectors overview

When you create a test with QA Wolf, each action you take (like clicking and typing) is converted to test code. The generated test code captures the [element](https://developer.mozilla.org/en-US/docs/Glossary/Element) you interacted with so that it can target that element when running your test. But how exactly does this work?

### Target attributes

During test creation, when you click on an element QA Wolf first checks to see if it has any [attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started) specified by the [`QAW_ATTRIBUTE` environment variable](api/environment_variables#qaw_attribute). The default value of `QAW_ATTRIBUTE` is `data-cy,data-qa,data-test,data-testid`. This means that if an element has the `data-cy`, `data-qa`, `data-test`, or `data-testid` attribute, the generated code will target the element based on that attribute.

For example, if you click on an element with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button data-qa="submit">Submit</button>
```

The generated test code will target an element with the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `[data-qa='submit']`:

```js
it('can click "Submit" button', async () => {
  await browser.click({ css: "[data-qa='submit']" });
});
```

When you run your test, QA Wolf will look for an element where the `data-qa` attribute is set to `submit`. If it cannot find an element where `data-qa` equals `submit` before timing out, the test fails.

You can [set the value of `QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute) to choose what attributes QA Wolf uses when generating test code. You can specify any number of test attributes like `data-qa`, and other attributes like `id` and `aria-label`.

### Default selector logic

If you click on an element that does not have an attribute specified by [`QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute), QA Wolf will fall back to its default selector logic. The default logic stores all attributes of an element, as well as the attributes of its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement). It then tries to find a close enough match to the target element when running your tests.

For example, let's say you click on an element with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button class="large" id="submit">Submit</button>
```

The generated test code will look like:

```js
it('can click "Submit" button', async () => {
  await browser.click(selectors[0]);
});
```

The `selectors[0]` argument passed to `browser.click` references a selector in the corrseponding selectors file for your test. This file is saved at `.qawolf/selectors/myTestName.json` and looks something like this:

```json
// myTestName.json
[
  {
    "index": 0,
    "html": {
      "ancestors": [
        "<footer class=\"footer\"></footer>",
        "<div class=\"container\"></div>"
      ],
      "node": "<button class=\"large\" id=\"submit\" innertext=\"Submit\">Submit</button>"
    }
  }
]
```

In the code above, you'll notice that the element you clicked on is stored under the `"node"` key, and that all of its attributes are saved. The two direct ancestors are also stored under the `"ancestors"` key of the `Selector` object.

When you run your test, QA Wolf will look for a close enough match to the original element you clicked on. It will consider all of the target element attributes, as well as those of its two ancestors. By not relying on a single brittle selector, your tests will be more robust to situations like dynamic CSS classes and changes to your front end code.

Because the selectors file contains the information QA Wolf needs to find each element, you should avoid editing it.

To learn more about how QA Wolf finds a close enough match to the target element, see [how it works documentation](how_it_works#element-selectors).

## Edit generated selectors

You can edit element selectors as you create your test, since the [test code is generated](create_a_test#review-test-code) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out selectors.

If you find yourself using the same attribute frequently to target elements, such as the `data-qa` attribute, try [setting `QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute). This will configure QA Wolf to target elements using that attribute whenever possible.

QA Wolf supports two types of custom selectors: [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and text selectors.

- CSS selectors find the element matching the CSS selector, for example: `#my-id`, `.my-class`, `div.my-class`
- Text selectors find the element that contains the given text

In your test code, replace the default selector (like `selectors[0]`) with an object containing either the `css` or `text` key and the desired target value. For example:

```js
it('can click "Submit" button', async () => {
  // change this
  await browser.click(selectors[0]);
  // to this (CSS selector)
  await browser.click({ css: "#submit" });
  // or this (text selector)
  await browser.click({ text: "Submit" });
});
```

See [documentation on the `browser.click` method](api/browser/click#examples) for more examples.

Whenever you target an element with a CSS or text selector, make sure that your selector is as specific as possible. If your selector matches multiple elements on the page, you could end up with the wrong element being acted upon in your test.

## Add test attributes to application code

A best practice in testing is to use [test attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) like `data-qa` or `data-test`, which make your tests robust to changes in your front end code.

You can update your front end code to include these test attributes. Don't worry - you don't need to do this all at once. If a test attribute is not included for a test step, QA Wolf will fall back to the [default selector logic](#default-selector-logic).

In this guide we'll use the `data-qa` attribute as our test attribute, but you can use whatever attribute you like. `data-*` attributes allow you to store extra information on your element, and in our case we'll use `data-qa` to label elements that are used in our tests.

Let's say we have a submit button in our application with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button>Submit</button>
```

To explicity label our element for use in testing, we'll add a `data-qa` attribute with the value of `"submit"`:

```html
<button data-qa="submit">Submit</button>
```

Now even as the text, [CSS classes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-class), and other attributes of our submit button change, the `data-qa` attribute will always label it as the `"submit"` element to use in tests.

## Next steps

Congratulations - you've learned about targeting elements in your test code! 🎉

There are a few places you might want to go from here:

- [Add assertions](add_assertions) to your tests
- [Change input values](change_input_values) in your tests
- Learn more about the [default selector logic](how_it_works#element-selectors)
- Learn more about the [interactive REPL](use_the_repl)
