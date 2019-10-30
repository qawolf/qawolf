## 🐺 qawolf ![](https://github.com/qawolf/qawolf/workflows/Test/badge.svg) [![Gitter chat](https://badges.gitter.im/qawolf/gitter.png)](https://gitter.im/qawolf/community)

:construction: More documentation coming soon

Setup browser tests with one command, using [Jest](https://jestjs.io) and [Puppeteer](https://pptr.dev).

```sh
npm i qawolf && npx qawolf record google.com
```

## CLI

### `npx qawolf record <url> [name]`

- opens a browser to record your actions
- creates a [Jest](https://jestjs.io) and [Puppeteer](https://pptr.dev) test in `.qawolf/tests` after you close the browser

### `npx qawolf test` or `npx qawolf test [name]`

Runs your `.qawolf/tests` Jest tests.
