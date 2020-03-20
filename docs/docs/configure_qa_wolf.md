---
id: configure_qa_wolf
title: 🛠️ Configure QA Wolf
---

QA Wolf provides several options for you to configure your experience.

## TL;DR

- If you haven't already, run the following to create a `qawolf.config.js` file in your project:

```bash
npm init qawolf
```

- Update the `qawolf.config.js` file accordingly

## The `qawolf.config.js` file

Your configuration for QA Wolf lives in the `qawolf.config.js` file at the root of your project. This file is created for you when you run the following:

```bash
npm init qawolf
```

Here is a full `qawolf.config.js` file. Note that only some of these settings are specified in the default generated file.

```js
module.exports = {
  // set QAW_ATTRIBUTE
  attribute: 'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/',
  // jest --config='{}'
  config: '{}',
  // where tests are created
  rootDir: '.qawolf',
  // jest --testTimeout=60000
  testTimeout: 60000,
  // generate .ts files, use ts-node for scripts
  useTypeScript: false,
};
```

Below we go through the values that can be configured. Each of them is optional.

### attribute

The `attribute` key in `qawolf.config.json` sets the [`QAW_ATTRIBUTE` environment variable](api/environment_variables#qaw_attribute). This allows you to choose which attributes to use as element selectors in the generated code.

**Default:** `'data-cy,data-e2e,data-qa,data-test,data-testid,/^qa-.*/'`

See the guide on [using custom selectors](use_custom_selectors#target-attributes) to learn more.

### config

Specifies which config is passed to [Jest](https://jestjs.io) when running your tests:

```bash
jest --config='{}'
```

By default QA Wolf uses `{}` to avoid conflicting with an existing Jest configuration. If not specified, nothing will be passed to Jest.

**Default:** `'{}'`

See [Jest documentation](https://jestjs.io/docs/en/cli#--configpath) to learn more.

### rootDir

The diretory where tests and scripts will be created. For example, a test with the name `myTestName` will be saved in a file called `${rootDir}/myTestName.test.js`.

**Default:** `'.qawolf'`

### testTimeout

Default timeout of a test in milliseconds. This value is passed to Jest when running your tests:

```bash
jest --testTimeout=60000
```

**Default:** `60000`

See [Jest documentation](https://jestjs.io/docs/en/cli#--testtimeoutnumber) to learn more.

### useTypeScript

Whether or not to use [TypeScript](https://www.typescriptlang.org). If set to `true`, tests and scripts will be created in TypeScript and saved with the `.ts` file extension. Scripts will be run using `ts-node`.

**Default:** `false`
