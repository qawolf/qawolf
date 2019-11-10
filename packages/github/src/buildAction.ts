import { readFileSync } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";

const actionTemplate = compile(
  readFileSync(resolve(__dirname, "../static/action.hbs"), "utf8")
);

export const buildAction = (): string => {
  return actionTemplate({});
};
