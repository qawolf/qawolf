---
id: edit_test_code
title: ✏️ Edit Test Code
---

In previous tutorials we [created our first browser test](create_a_test) and [ran it locally](run_a_test_locally) to make sure it works.
Editing your test code is not necessary, and you can use generated code as is.

## Overview

We will learn how to [add an assertion](edit_test_code#add-an-assertion), [use a custom CSS or text selector](edit_test_code#use-custom-selectors) to locate an element, and [change an input value](edit_test_code#change-input-values).

This tutorial edits a sample test file for [TodoMVC](http://todomvc.com/examples/react). Below is a GIF of the example test running locally:

![Run a test locally](https://storage.googleapis.com/docs.qawolf.com/tutorials/run_test.gif)

## Add an assertion

Let's beef up our test by adding a few assertions. First, we'll add an assertion that the "Clear completed" text appears after we complete our todo.

To do this, we'll use the [`browser.hasText` method](docs/api#browserhastexttext-options). This method automatically waits for the given text to appear on the page. It returns `true` if the text is found, and `false` if the text does not appear before timing out.

In our test code, let's update the following step where we click to complete the todo. We'll call `browser.hasText("Clear completed")`, assign the result to a variable called `hasClearCompletedText`, and assert that `hasClearCompletedText` is `true`. See [Jest documentation](https://jestjs.io/docs/en/expect) to learn more about assertions.

```js
it("can click input", async () => {
  await browser.click(selectors[2]);

  // custom code starts
  // verify that "Clear completed" text appears
  const hasClearCompletedText = await browser.hasText("Clear completed");
  expect(hasClearCompletedText).toBe(true);
  // custom code ends
});
```

If you run the test again (`npx qawolf test myFirstTest`), you'll see that it still passes.

After we clear completed todos, we should no longer see any todos on the page. We'll add code that waits until the todos `<section>` no longer exists on the page to verify that it disappears. To do so, we'll use the [`waitUntil` helper method](api#qawolfwaituntilpredicate-timeoutms-sleepms), which takes a function and a timeout in milliseconds. It waits until the function returns `true`, throwing an error if the timeout is reached. We'll also use the [Puppeteer API](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md).

Now let's update the test code. Here is a summary of what we'll do:

1. Use the [`browser.page` method](api#browserpageoptions) to get the current [Puppeteer `page` instance](https://github.com/puppeteer/puppeteer/blob/v2.0.0/docs/api.md#class-page).
2. Call [`waitUntil`](api#qawolfwaituntilpredicate-timeoutms-sleepms), passing it a function that calls [Puppeteer's `page.$` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageselector) to find the todos `<section>`. The `page.$` method runs [`document.querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) with the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and returns the matching [Puppeteer `ElementHandle`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#class-elementhandle) or null if none found.
3. Pass the [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) `section.main` to [Puppeteer's `page.$` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageselector). In [TodoMVC](http://todomvc.com/examples/react), `section.main` contains the todos and will disappear from the page once todos have been cleared.

Once the todos `<section>` no longer exists because the todos have been cleared, we will end the test. If a bug on the application prevents the todos from being cleared, the test will fail.

First, update the first line of your test file to also import `waitUntil` from `qawolf`:

```js
// change this
const { launch } = require("qawolf");
// to this
const { launch, waitUntil } = require("qawolf");
```

Then update the final step of the test:

```js
it('can click "Clear completed" button', async () => {
  await browser.click(selectors[3]);

  // custom code starts
  // get current Puppeteer page instance
  const page = await browser.page();

  // verify that todos disappear after clearing completed
  await waitUntil(async () => {
    // find the todos section on the page
    const todosSection = await page.$("section.main");
    // return true once the secton is null (no longer exists)
    return todosSection === null;
  }, 15000); // wait 15 seconds before timing out
  // custom code ends
});
```

If you run the test again (`npx qawolf test myFirstTest`), you'll see that it still passes.

See [our API documentation](api) for a full list of methods you can use to write assertions.

## Use custom selectors

As [discussed earlier](review_test_code#element-selectors), the default selector in the generated test code contains all attributes of an element and its two direct [ancestors](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement). When running a test, the `qawolf` library will wait for a close enough match to the default selector before moving on. If no suitable match is found before timing out, the test will fail.

You may want to edit the test code to use selectors of your choosing rather than the default selectors. This allows you to be explicit about which element to target in each step of your test.

The two supported custom selectors are [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) and text selectors:

- [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) find the element matching the CSS selector, for example: `#my-id`, `.my-class`, `div.my-class`, `[data-qa="my-input"]`
- Text selectors find the element that contains the given text

In your test code, replace the default selector (for example, `selectors[0]`) with an object containing either the `css` or `text` key and the desired target value. For example:

```js
it('can click "Clear completed" button', async () => {
  // change this
  await browser.click(selectors[3]);
  // to this (CSS selector)
  await browser.click({ css: ".clear-completed" });
  // or this (text selector)
  await browser.click({ text: "Clear completed" });
});
```

See [documentation on the `Selector` interface](api#interface-selector) to learn more.

Try changing the default selector to either of the above examples. Then run your test again (`npx qawolf test myFirstTest`) and notice that it still passes.

Whenever you target an element with a CSS or text selector, make sure that your selector is as specific as possible. If your selector matches multiple elements on the page, you could end up with the wrong element being acted upon in your test.

## Use data attributes

A best practice in testing is to add [data attributes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes) like `data-qa` to target elements. This involves editing your front end code, but it allows you to be most explicit about which elements to target when running tests. For example:

```html
<!-- change this -->
<button class="clear-completed">Clear completed</button>
<!-- to this -->
<button data-qa="clear-button" class="clear-completed">Clear completed</button>
```

If you have added a data attribute to an element in your test, you can update the test code to use a CSS selector targeting that data attribute and value.

```js
it('can click "Clear completed" button', async () => {
  // change this
  await browser.click(selectors[3]);
  // to this
  await browser.click({ css: "[data-qa='clear-button']" });
});
```

You can also record your test while setting the [`QAW_DATA_ATTRIBUTE` environment variable](api#qaw_data_attribute). This will use your data attribute to find elements where applicable rather than the default selector logic. For example:

```bash
QAW_DATA_ATTRIBUTE=data-qa npx qawolf record www.myawesomesite.com myTest
```

See [our documentation](api#qaw_data_attribute) to learn more about the `QAW_DATA_ATTRIBUTE` environment variable.

## Change input values

When recording `type` actions, whatever you originally typed will be captured in the test by default. This value will the be passed as the second argument to [`browser.type`](api#browsertypeselector-value-options). In our example, we typed `"create smoke test!"` as our todo item in the first step of our test. The following code was then generated:

```js
it('can type into "What needs to be done?" input', async () => {
  await browser.type(selectors[0], "create smoke test!");
});
```

However, you may want to change this input value to something else. The simplest way to do this is to change that second argument to [`browser.type`](api#browsertypeselector-value-options) in the test code:

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "create smoke test!");
  // to this
  await browser.type(selectors[0], "update smoke test!");
});
```

If you run the test again (`npx qawolf test myFirstTest`) you'll see that it now types `"update smoke test!"` in the first step.

You can also pass an environment variable to [`browser.type`](api#browsertypeselector-value-options). To do this, update the test code to use `process.env.YOUR_ENV_VARIABLE`:

```js
it('can type into "What needs to be done?" input', async () => {
  // change this
  await browser.type(selectors[0], "create smoke test!");
  // to this
  await browser.type(selectors[0], process.env.TODO_VALUE);
});
```

You can then run your test again, passing the appropriate environment variable. It will now type the value of your environment variable in the first step.

```bash
TODO_VALUE="create environment variable!" npx qawolf test myFirstTest
```

One final note: **you should always replace sensitive input values like passwords with environment variables.** Use the above example as a reference.

## Use Puppeteer

The generated test code gives you full access to the [Puppeteer API](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md).

Many of the methods you may want to use are on Puppeteer's [`Page`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page) class. [`browser.page`](api#browserpageoptions) gives you access to the current page. You can then call these methods on the resulting `Page` instance.

Below is an example of setting a cookie with Puppeteer's [`page.setCookie` method](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetcookiecookies) and then reloading the page with the [`page.reload` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagereloadoptions).

```js
describe("my_workflow", () => {
  it('can click "increment count" button', async () => {
    // custom code starts
    const page = await browser.page();

    await page.setCookie({
      name: "my-cookie-name",
      value: "my-cookie-value"
    });

    await page.reload();
    // custom code ends

    await click(selectors[0]);
  });
});
```

Here is another example, where we edit the [`beforeAll` block](https://jestjs.io/docs/en/api#beforeallfn-timeout) to [set a token](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) in local storage.

Again, we call [`browser.page`](api#browserpageoptions) to get the current Puppeteer `Page` instance, and then use Puppeteer's [`page.evalute` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pageevaluatepagefunction-args) to call `localStorage.setItem("token", "myTokenValue")`. Finally, we reload the page with the [`page.reload` method](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagereloadoptions).

```js
beforeAll(async () => {
  browser = await launch({ url: "myawesomesite.com" });

  // custom code starts
  const page = await browser.page();

  await page.evaluate(() => {
    localStorage.setItem("token", "myTokenValue");
  });

  await page.reload();
  // custom code ends
});
```

## Use Jest

The generated test code also gives you full access to the [Jest API](https://jestjs.io/docs/en/getting-started). You can write custom [test assertions](https://jestjs.io/docs/en/expect) with Jest.

Below is an example where we use Jest and QA Wolf's [`findProperty` helper](api#browserfindpropertyselector-property-options) to verify that the value of an input is what we expect it to be.

```js
describe("my_workflow", () => {
  it('can click "increment count" button', async () => {
    // custom code starts
    const count = await browser.findProperty(
      { css: "#my-counter-input" },
      "value"
    );
    expect(count).toBe("0");
    // custom code ends

    await click(selectors[0]);
  });
});
```

## Next steps

Congratulations - you can now edit your test code with confidence! 🎉

There are a few places you can go from here:

- [Run your tests in CI](set_up_ci)
- [Use TypeScript in your tests](use_typescript)
