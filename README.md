## 🐺 qawolf ![](https://github.com/qawolf/qawolf/workflows/Test/badge.svg)

:construction: More documentation coming soon

Setup browser tests with one command, using [Jest](https://jestjs.io) and [Puppeteer](https://pptr.dev).

```sh
npm i -g qawolf && qawolf record google.com
```

## CLI

### `qawolf record <url> [name]`

- opens a browser to record your actions
- creates a [Jest](https://jestjs.io) and [Puppeteer](https://pptr.dev) test in `.qawolf/tests` after you close the browser

### `qawolf test` or `qawolf test [name]`

Runs your `.qawolf/tests` Jest tests.
