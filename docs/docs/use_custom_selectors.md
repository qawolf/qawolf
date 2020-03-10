---
id: use_custom_selectors
title: 🔍 Use Custom Selectors
---

In this guide, we explain how QA Wolf generates element selectors and how you can edit these selectors. We assume you know how to [create a test](create_a_test).

## TL;DR

- [Element selectors in generated code](#selectors-overview) use attributes specified by [`QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute) if possible, and multiple attributes otherwise:

```js
test('myTestName', async () => {
  // CSS selector for test attribute if available
  await page.click('[data-qa="submit"]');
  // fallback
  await page.click(selectors['0_what_needs_to_b_input']);
});
```

- You can [edit the generated selectors](#edit-generated-selectors) to target elements based on [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or text selectors:

```js
test('myTestName', async () => {
  // change this
  await page.click(selectors['0_what_needs_to_b_input']);
  // to this (CSS selector)
  await page.click('#submit');
  // or this (text selector)
  await page.click('text="Submit"');
});
```

- To use test attributes like `data-qa`, [update your application code](#add-test-attributes-to-application-code) if needed

## Selectors overview

When you create a test with QA Wolf, each action you take (like clicking and typing) is converted to test code. The generated test code captures the [element](https://developer.mozilla.org/en-US/docs/Glossary/Element) you interacted with so that it can target that element when running your test. But how exactly does this work?

### Target attributes

During test creation, when you click on an element QA Wolf first checks to see if it has any [attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started) specified by the [`QAW_ATTRIBUTE` environment variable](api/environment_variables#qaw_attribute). The default value of `QAW_ATTRIBUTE` is `data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/`. This means that if an element has the `data-cy`, `data-e2e`, `data-qa`, `data-test`, or `data-testid` attribute, the generated code will target the element based on that attribute. It will also target attributes that match the [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) `/^qa-.*/`.

For example, if you click on an element with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button data-qa="submit">Submit</button>
```

The generated test code will target the element with the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `[data-qa='submit']`:

```js
await page.click('[data-qa="submit"]');
```

When you run your test, [Playwright](https://github.com/microsoft/playwright) will look for an element where the `data-qa` attribute is set to `"submit"`. If it cannot find an element where `data-qa` equals `"submit"` before timing out, the test fails.

You can [set the value of `QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute) to choose what attributes QA Wolf uses when generating test code. You can specify any number of test attributes like `data-qa`, [regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) like `/^qa-.*/`, and other attributes like `id` and `aria-label`.

QA Wolf does its best to generate the correct CSS selector, even if the specified attribute is on an ancestor of the target element. For example, some component libraries like [Material UI](https://material-ui.com) place data attributes on a wrapper `div` around inputs. Your front end code might look like this:

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

If you click on an element that does not have an attribute specified by [`QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute), QA Wolf will fall back to its default selector logic. The default logic stores all attributes of an element, as well as the attributes of its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement). It then tries to find a close enough match to the target element when running your tests.

For example, let's say you click on an element with the following [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML):

```html
<button class="large" id="submit">Submit</button>
```

The generated test code will look like:

```js
await page.click(selectors['0_submit']);
```

The `selectors['0_submit']` argument passed to `page.click` references a selector in the corrseponding selectors file for your test. This file is saved at `.qawolf/selectors/myTestName.json` and looks something like this:

```json
// myTestName.json
{
  "0_submit": "html=<footer class=\"footer\"><div class=\"container\"><button class=\"large\" id=\"submit\" innertext=\"Submit\">Submit</button></div></footer>"
  // ...
}
```

In the code above, you'll notice that the element you clicked on is stored under the `"0_submit"` key, and that all of its attributes are saved. The two direct ancestors are also stored.

When you run your test, Playwright will look for a close enough match to the original element you clicked on. It will consider all of the target element attributes, as well as those of its two ancestors. By not relying on a single brittle selector, your tests will be more robust to situations like dynamic CSS classes and changes to your front end code.

Because the selectors file contains the information Playwright needs to find each element, you should avoid editing it.

These HTML selectors work with Playwright because we created a custom selector engine called `playwright-html-selector`. To learn more, see the [`playwright-html-selector` source code](https://github.com/qawolf/playwright-html-selector).

## Edit generated selectors

You can edit element selectors as you create your test, since the [test code is generated](create_a_test#review-test-code) as you use your application. The [interactive REPL](use_the_repl) can be helpful in trying out selectors.

If you find yourself using the same attribute frequently to target elements, such as the `data-qa` attribute, try [setting `QAW_ATTRIBUTE`](api/environment_variables#qaw_attribute). This will configure QA Wolf to target elements using that attribute whenever possible.

Playwright supports a few types of selectors. We discuss [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and text selectors in this guide.

- CSS selectors find the element matching the CSS selector, for example: `#my-id`, `.my-class`, `div.my-class`
- Text selectors find the element that contains the given text

In your test code, replace the default selector (like `selectors['0_submit']`) with a string containing your selector. Prefix text selectors with `text=`. For example:

```js
// change this
await page.click(selectors['0_submit']);
// to this (CSS selector)
await page.click('#submit');
// or this (text selector)
await page.click('text="Submit"');
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

- [Add assertions](add_assertions) to your tests
- [Change input values](change_input_values) in your tests
- Learn more about the [interactive REPL](use_the_repl)
