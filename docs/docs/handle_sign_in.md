---
id: handle_sign_in
title: 🔐 Handle Sign In
---

One of the most common scenarios our tests should handle is signing in (authentication). Signing in programmatically has several benefits:

- Your tests will run faster because they do not need to sign in through the [UI](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface) every time
- Test flakiness will be reduced, especially if sign in relies on third party services like Google
- Your test code will be easier to maintain, since it will have fewer steps and will be shielded from changes to your sign in UI

You can (and probably should) still create tests that sign in as a user would. However, if you find that many of your tests go through the same sign in steps, you should consider using programmatic sign in.

QA Wolf supports automating sign in through a few different channels. Choose the one that best suits your use case.

## TL;DR

- [Save user state data to a file](#load-user-state-from-file) and [load it before running a test](#load-user-state):

```js
await qawolf.saveState(page, './.qawolf/state/admin.json');
await qawolf.setState(page, './.qawolf/state/admin.json');
```

- [Add sign in code to an existing test](#add-sign-in-code-to-an-existing-test). Then call `qawolf.create` where you want to insert additional test code:

```js
await qawolf.create();
```

## Load user state from file

The most straightforward way to handle sign in is to save user state ([cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), and [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)) to a file. Your test can then load this file and apply the data to the page.

### Save user state

QA Wolf provides the [`saveState` helper](api/qawolf/save_state) to make saving user state easy. In this example, we'll call it in the [interactive REPL](use_the_repl), but you can also call it in a test file.

Let's create a test for using Twitter as a signed in user. We'll start by creating a test with the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name). We will then sign in to Twitter through their [UI](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface), and use the REPL to save our state data.

In the command line, run the following to start creating a test:

```bash
npx qawolf create www.twitter.com mySignInTest
```

A browser will open the specified URL (`www.twitter.com` in our example). Sign in to the application as a user would. For Twitter, this means entering your e-mail and password before clicking the "Log in" button.

After you have signed in, open the REPL from the command line by choosing `🖥️ Open REPL to run code`. Inside the REPL, call the [`qawolf.saveState` method](api/qawolf/save_state), passing it the page and the path where you would like your state data to be saved:

```js
await qawolf.saveState(page, './.qawolf/state/user.json');
```

You'll notice that your state data was saved as [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) in the specified file (`.qawolf/state/user.json` in our example). If you open that file, it will look something like the following. The values of the `"cookies"`, `"localStorage"`, and `"sessionStorage"` keys will vary by application:

```json
{
  "cookies": [
    // ...
    {
      "sameSite": "None",
      "name": "lang",
      "value": "en",
      "domain": "twitter.com",
      "path": "/",
      "expires": -1,
      "httpOnly": false,
      "secure": false
    }
    // ...
  ],
  "localStorage": {},
  "sessionStorage": {}
}
```

After saving your state data, you can exit the test creation process. We now have our user state file, and we do not need to save our test. In the command line, choose `🗑️ Discard and exit` to exit.

### Load user state

Now we can create a test that programatically signs in before running. Specifically, it will load our user state data in the [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout). The [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name) has a `--statePath` flag to create code that handles this automatically.

Run the following in the command line, setting `--statePath` to the path where your state data is saved:

```bash
npx qawolf create --statePath=./.qawolf/state/user.json www.twitter.com mySignInTest
```

A browser will open and the [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), and [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) from your state file will be applied. You can then create your test as a signed in user.

If you open your test file (`.qawolf/mySignInTest.test.js` in our example), you will see that it calls the [`qawolf.setState` method](api/qawolf/set_state) in the [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout). This method loads the state data from the specified file and applies it to the page:

```js
// ...
test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.twitter.com/');
  await qawolf.setState(page, './.qawolf/state/user.json');
  // ...
});
```

The actions you take will be converted to test code after `qawolf.setState` is called. Now you can test your application as a signed in user!

## Add sign in code to an existing test

Another way to handle sign in is to programmatically set [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), or [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) at the beginning of your test. This option is appropriate if you 1) understand how sign in works on the application you are testing and 2) know which cookies or `localStorage`/`sessionStorage` values to set for your test user.

Rather than create a test from scratch, we can use the [`qawolf.create` method](api/qawolf/create) to add code to an existing file. You can create a "template" test file manually or with the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name). You can also modify an existing test file.

To create a new test file with `npx qawolf create`, run the following in the CLI:

```bash
npx qawolf create www.myawesomesite.com mySignInTest
```

After the page loads, choose the `💾 Save and Exit` option in the CLI to save your "template" test and selector files.

Your test file (`.qawolf/mySignInTest.test.js` in our example) should look like the following:

```js
const qawolf = require('qawolf');

let browser;
let context;

beforeAll(async () => {
  browser = await qawolf.launch();
  context = await browser.newContext();
  await qawolf.register(context);
});

afterAll(async () => {
  await qawolf.stopVideos();
  await browser.close();
});

test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.myawesomesite.com/');
});
```

Right now our test doesn't do much - just visits the URL we specified.

To handle sign in, we need to 1) call [`qawolf.create`](api/qawolf/create) where we want test code to be inserted and 2) update our test to sign in programmatically.

We'll first add a line to our file that tells QA Wolf where to insert new code. Specifically, we'll call the [`qawolf.create` method](api/qawolf/create) at the end of our [Jest `test` block](https://jestjs.io/docs/en/api#testname-fn-timeout). When we run our test, we can use our application to generate additional test code as a signed in user.

```js
// ...
test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.myawesomesite.com/');
  await qawolf.create(); // add this line
});
```

Now let's update our test to sign in programmatically. This code will run first, so that we are signed in when `qawolf.create` is called.

### Set cookies

If your application involves setting cookies for authentication, use the [Playwright `context.addCookies`](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsercontextaddcookiescookies) method.

At the end of the `beforeAll` block, call `context.addCookies` and pass it an array of cookie objects. Below is an example `beforeAll` block that does this:

```js
beforeAll(async () => {
  browser = await qawolf.launch();
  const context = await browser.newContext();
  await qawolf.register(context);
  page = await context.newPage();

  // sign in code starts
  await context.addCookies([
    {
      name: 'my_cookie',
      value: 'my_cookie_value',
      domain: 'my_domain',
      path: '/',
    },
  ]);
  // sign in code ends
});
```

See [Playwright documentation](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsercontextsetcookiescookies) to learn more about the `context.setCookies` method.

### Set `localStorage` or `sessionStorage`

If your application involves setting [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) for authentication, use Playwright's [`page.evaluate` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevaluatepagefunction-args).

After `page.goto` is called in the `test` block, call `page.evaluate` and pass it the function you want to run in the browser. Below is an example that sets a value in `localStorage` with the [`setItem` method](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem):

```js
// ...
test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.myawesomesite.com/');
  // sign in code starts
  await page.evaluate(() => {
    localStorage.setItem('token', 'value');
  });
  // sign in code ends
  await qawolf.create();
});
```

Below is an example that sets a value in `sessionStorage` with the [`setItem` method](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem):

```js
// ...
test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.myawesomesite.com/');
  // sign in code starts
  await page.evaluate(() => {
    sessionStorage.setItem('token', 'value');
  });
  // sign in code ends
  await qawolf.create();
});
```

You may have to call the [`page.reload` method](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagereloadoptions) after `page.evaluate` so the `localStorage` and `sessionStorage` changes can take effect:

```js
// ...
test('mySignInTest', async () => {
  const page = await context.newPage();
  await page.goto('https://www.myawesomesite.com/');
  // sign in code starts
  await page.evaluate(() => {
    localStorage.setItem('token', 'value');
  });
  await page.reload();
  // sign in code ends
  await qawolf.create();
});
```

See [Playwright documentation](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageevaluatepagefunction-args) to learn more about the `page.evaluate` method.

### Finish your test

Now you can edit your test with the [`npx qawolf edit` command](api/cli#npx-qawolf-edit-name). See the guide on [editing tests](edit_a_test) to learn more.

```bash
npx qawolf edit mySignInTest
```

The code before `qawolf.create` will run first, signing you in. You can then add additional steps to your test as a signed in user!

## Next steps

Congratulations - you've learned how to automate sign in! 🎉

There are a few places you might want to go from here:

- Learn more about the [interactive REPL](use_the_repl)
- Learn how to [edit an existing test](edit_a_test)
