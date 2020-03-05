type ExpressionOptions = {
  code: string;
  description: string;
};

type TemplateOptions = {
  name: string;
  url: string;
};

// TODO conditional url & device...

export const buildAction = ({ code, description }: ExpressionOptions): string =>
  `// ${description}\n${code}\n`;

export const buildTemplate = ({ name, url }: TemplateOptions): string => {
  const code = `const qawolf = require("qawolf");

const ${name} = async context => {
  let page = await context.newPage();
  await page.goto("${url}");
  await qawolf.create();
};

exports.${name} = ${name};

if (require.main === module) {
  (async () => {
    const browser = await qawolf.launch();
    const context = await browser.newContext();
    await qawolf.register(context)
    await ${name}(context);
    await browser.close();
  })();
}`;

  return code;
};
