---
id: use_typescript
title: ⌨️ Use TypeScript
---

Like [TypeScript](https://www.typescriptlang.org/)? So do we! [`qawolf`](api) is built with Typescript and is distributed with types.

In this tutorial we will change our code to TypeScript. We assume you have [created a test](create_a_test), and have a [basic understanding of the test code](review_test_code).

## Use TypeScript

To change your code to Typescript:

1. Rename the script or test file extension from `.js` to `.ts`.

For example, if your test file is called `.qawolf/tests/myFirstTest.test.js`, reanme it to `.qawolf/tests/myFirstTest.test.ts`.

2. Change the `require("qawolf")` to an [`import` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import). This line should be the first one in your generated code.

```js
// change this
const { launch } = require("qawolf");

// to this
import { launch } from "qawolf";
```

3. If you have not already, for browser tests install types for [Node.js](https://www.npmjs.com/package/@types/node), [Puppeteer](https://www.npmjs.com/package/@types/puppeteer), and [Jest](https://www.npmjs.com/package/@types/jest):

```bash
npm i -D @types/node @types/puppeteer @types/jest
```

For browser scripts install types for [Node.js](https://www.npmjs.com/package/@types/node) and [Puppeteer](https://www.npmjs.com/package/@types/puppeteer):

```bash
npm i -D @types/node @types/puppeteer
```

Now you have all advantages of using Typescript!
