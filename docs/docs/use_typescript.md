---
id: use_typescript
title: ⌨️ Use TypeScript
---

Like [TypeScript](https://www.typescriptlang.org/)? So do we! QA Wolf is built with TypeScript and distributed with types.

In this guide, we show you how to change your code to TypeScript. We assume you have [created a test](create_a_test) or [script](create_a_script).

## Use TypeScript

To change your code to TypeScript, use the following three steps.

1. Rename the test or script file extension from `.js` to `.ts`.

For example, if your test file is called `.qawolf/tests/myTestName.test.js`, rename it to `.qawolf/tests/myTestName.test.ts`.

TODOUPDATE

2. Change `require("qawolf")` to an [`import` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import):

```js
// change this
const { launch } = require("qawolf");

// to this
import { launch } from "qawolf";
```

3. Install types if you haven't already.

For browser tests, install types for [Node.js](https://www.npmjs.com/package/@types/node), [Playwright](https://www.npmjs.com/package/@types/playwright), and [Jest](https://www.npmjs.com/package/@types/jest):

```bash
npm install --save-dev @types/node @types/playwright @types/jest
```

For browser scripts, install types for [Node.js](https://www.npmjs.com/package/@types/node) and [Playwright](https://www.npmjs.com/package/@types/playwright):

```bash
npm install --save-dev @types/node @types/playwright
```

Enjoy using TypeScript! 😌
