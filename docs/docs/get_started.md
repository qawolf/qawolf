---
id: get_started
title: 🏁 Get Started
---

QA Wolf is a delightful [open source](https://github.com/qawolf/qawolf) recorder that translates your browser actions into [Puppeteer](https://github.com/puppeteer/puppeteer) and [Jest](https://jestjs.io/) code. It [automatically waits](how_it_works#-automatic-waiting) for elements and assertions and builds a [smart element selector](how_it_works#-element-selectors) to ensure stability. QA Wolf supports multiple windows, hot keys, and other complex scenarios.

### 🖥️ Install QA Wolf

Install QA Wolf as a dev dependency with [`npm`](https://www.npmjs.com):

```bash
cd /my/awesome/project
npm install --save-dev qawolf
```

### ✅ Record a browser test

```bash
npx qawolf record <url> [name]
```

This will open a Chromium browser where your actions will be recorded. If a name is not provided, the test name will default to the URL hostname.

When you are done, press enter in the CLI to save your test:

```bash
? Save [Y/n]
```

The test will be stored in a `.qawolf` folder.

```bash
.qawolf # current directory
├── tests
│   └── myTest.test.js
├── selectors
│   └── myTest.json
```

The `.qawolf/tests/myTest.test.js` file contains [Puppeteer](https://pptr.dev/) and [Jest](https://jestjs.io) code that you can [edit](edit_your_code). The `.qawolf/selectors/myScript.json` file contains the test element selectors.

Run your test:

```bash
qawolf test [name]
```

If you provide an incorrect name, it will ask you to choose from a list of your tests.

### 🤖 Record a browser script

```bash
npx qawolf record --script <url> [name]
```

This will open a Chromium browser where your actions will be recorded. If a name is not provided, the script name will default to the URL hostname.

When you are done, press enter in the CLI to save your script:

```bash
? Save [Y/n]
```

The script will be stored in a `.qawolf` folder.

```bash
.qawolf # current directory
├── scripts
│   └── myScript.js
├── selectors
│   └── myScript.json
```

The `.qawolf/scripts/myScript.js` file contains [Puppeteer](https://pptr.dev/) code that you can [edit](edit_your_code). The `.qawolf/selectors/myScript.json` file contains the script element selectors.

Run your script:

```bash
node .qawolf/scripts/name.js
```
