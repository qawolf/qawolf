---
id: use_typescript
title: ⌨️ Use TypeScript
---

Like [TypeScript](https://www.typescriptlang.org/)? So do we! QA Wolf is built with TypeScript and distributed with types.

In this guide, we show you how to configure QA Wolf to create TypeScript code.

## Use TypeScript

If you haven't already, run the following command in your project:

```bash
npm init qawolf
```

If your project is already using TypeScript (has a `tsconfig.json` file), QA Wolf will automatically create TypeScript code when you call the [`npx qawolf create` command](api/cli#npx-qawolf-create-url-name).

Otherwise, you can edit the generated `qawolf.config.js` file, setting `useTypeScript` to `true`:

```js
module.exports = {
  config: '{}',
  rootDir: '.qawolf',
  testTimeout: 60000,
  // set useTypeScript to true
  useTypeScript: true,
};
```

See the guide on [configuring QA Wolf](configure_qa_wolf) to learn more.

Enjoy using TypeScript! 😌
