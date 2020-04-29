---
id: use_custom_selectors
title: 🔍 Use Custom Selectors
---

:::tip TL;DR

- [Element selectors](#selectors-overview) use attributes specified by the [`attribute` key in `qawolf.config.js`](configure_qa_wolf#attribute) if possible:

```js
test('myTest', async () => {
  // CSS selector for test attribute if available
  await page.click('[data-qa="submit"]');
});
```

- Otherwise, QA Wolf uses the best available [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text selector. [Edit the generated selectors](#edit-generated-selectors) as you like:

```js
test('myTest', async () => {
  // CSS selector
  await page.click('#submit');
  // text selector
  await page.click('text=Submit');
});
```

- To use test attributes like `data-qa`, [update your application code](#add-test-attributes-to-application-code) if needed

:::

<br/>

In this guide, we explain how QA Wolf generates element selectors and how you can edit these selectors. We assume you know how to [create a test](create_a_test).

## Selectors overview

When you create a test with QA Wolf, each action you take (like clicking and typing) is converted to test code. The generated test code captures the [element](https://developer.mozilla.org/en-US/docs/Glossary/Element) you interacted with so that it can target that element when running your test. But how exactly does this work?

### Target attributes

When you click on an element, QA Wolf first checks to see if it has any [attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started) specified by the [`attribute` key in `qawolf.config.js`](configure_qa_wolf#attribute). By default if an element has the `data-cy`, `data-e2e`, `data-qa`, `data-test`, or `data-testid` attribute, the generated code will target a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) for that attribute.

For example, if you click on an element with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button data-qa="submit">Submit</button>
```

The generated test code will target the element with the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `[data-qa='submit']`:

```js
await page.click('[data-qa="submit"]');
```

When you run your test, [Playwright](https://github.com/microsoft/playwright) will look for an element where the `data-qa` attribute is set to `"submit"`. If it cannot find an element where `data-qa` equals `"submit"` before timing out, the test fails.

You can [set the `attribute` key in `qawolf.config.js`](configure_qa_wolf#attribute) to choose what attributes QA Wolf prefers when generating test code. You can specify any number of test attributes like `data-qa`, [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) like `/^qa-.*/`, and other attributes like `id` and `aria-label`.

QA Wolf does its best to use a specified attribute, even if the attribute is on an ancestor of the target element. For example, some component libraries like [Material UI](https://material-ui.com) place data attributes on a wrapper `div` around inputs. Your front end code might look like this:

```js
import React from 'react';
import TextField from '@material-ui/core/TextField';

function MyTextInput() {
  return <TextField data-qa="username" label="Username" />;
}
```

The corresponding HTML will be:

```html
<div data-qa="username">
  <label>Username</label>
  <div>
    <input type="text" value="" />
  </div>
</div>
```

In this case, the correct CSS selector is `[data-qa='username'] input` rather than just `[data-qa='username']`. If we do not include `input` in the generated CSS selector, the test will try unsuccessfully to type into a `div`.

QA Wolf does its best to target the correct element in scenarios like these. In our example, the generated test code will be:

```js
await page.type('[data-qa="username"] input', 'target the input!');
```

### Default selector logic

If you click on an element that does not have an attribute specified by the [`attribute` key in `qawolf.config.js`](configure_qa_wolf#attribute), QA Wolf will fall back to its default selector logic.

In a nutshell, the default selector logic chooses the best available [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text selector for the target element. It prefers attributes like `id` over attributes like `href`. If there is not a matching selector for the target element alone, QA Wolf will try to find one that includes an [ancestor](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement).

The default selector logic checks that the selector does not match a different element. It also does its best to avoid using dynamic `class` and `id` attributes.

As a last resort, QA Wolf will target an element by its [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath).

## Edit generated selectors

You can edit element selectors as you create your test, since the [test code is generated](create_a_test#review-test-code) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out selectors.

[Playwright supports](https://github.com/microsoft/playwright/blob/master/docs/selectors.md) a few types of selectors. We discuss [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and text selectors in this guide.

- CSS selectors find the element matching the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors), for example: `#my-id`, `.my-class`, `[aria-label="home"]`
- Text selectors find the element that contains the given text, for example: `text=Click me!`

In your test code, replace the default selector with your desired CSS or text selector. Prefix text selectors with `text=`. For example:

```js
// change this
await page.click('.some-other-selector');
// to this (CSS selector)
await page.click('#submit');
// or this (text selector)
await page.click('text=Submit');
```

See [Playwright documentation on selectors](https://github.com/microsoft/playwright/blob/master/docs/api.md#working-with-selectors) to learn more.

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

- [Change input values](change_input_values) in your tests
- Learn more about the [interactive REPL](use_the_repl)
