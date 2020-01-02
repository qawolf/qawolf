---
id: use_typescript
title: ⌨️ Use TypeScript
---

[`qawolf`](api) is built with Typescript and is distributed with types. To change your code to Typescript:

1. Rename the script or test file extension from `.js` to `.ts`.

2. Change the `require("qawolf")` to an import:

```js
// change this
const { launch } = require("qawolf");

// to this
import { launch } from "qawolf";
```

3. If you have not already, install these types `npm i -D @types/node @types/puppeteer` and for tests `npm i -D @types/jest`.

Now you have all advantages of using Typescript!
