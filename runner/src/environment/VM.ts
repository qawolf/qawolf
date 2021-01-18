import assert from "assert";
import axios from "axios";
import { devices } from "playwright";
import { assertText } from "qawolf";
import { NodeVM } from "vm2";

import { Logger } from "../services/Logger";
import { launch, LaunchOptions, LaunchResult } from "./launch";
import { TransformCode, transformCode } from "./transformCode";

type VMOptions = {
  display?: string;
  logger: Logger;
  onLaunch: (launched: LaunchResult) => void | Promise<void>;
};

export type RunOptions = TransformCode & {
  onLineStarted: (line: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatMessage = (args: any[]): string => {
  return args.join(" ");
};

export class VM {
  _env: Record<string, string | undefined> = {};
  _logger: Logger;
  _vm: NodeVM;

  constructor(vmOptions: VMOptions) {
    this._logger = vmOptions.logger;

    this._vm = new NodeVM({
      console: "redirect",
      env: this._env,
      sandbox: this._buildSandbox(vmOptions),
    });

    this._captureConsoleLogs();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _buildSandbox(vmOptions: VMOptions): any {
    return {
      assert,
      assertText,
      axios,
      devices,
      launch: async (launchOptions: LaunchOptions) => {
        process.env.DISPLAY = vmOptions.display || ":0.0";

        const result = await launch(launchOptions);

        await vmOptions.onLaunch(result);

        return result;
      },
    };
  }

  _captureConsoleLogs(): void {
    this._vm.on("console.info", (...args) => {
      this._logger.log("console", "info", formatMessage(args));
    });

    this._vm.on("console.log", (...args) => {
      this._logger.log("console", "info", formatMessage(args));
    });

    this._vm.on("console.warn", (...args) => {
      this._logger.log("console", "warning", formatMessage(args));
    });

    this._vm.on("console.error", (...args) => {
      this._logger.log("console", "error", formatMessage(args));
    });
  }

  async run({
    code,
    endLine,
    helpers,
    onLineStarted,
    startLine,
    variables,
  }: RunOptions): Promise<void> {
    const codeToRun = transformCode({
      code,
      endLine,
      helpers,
      startLine,
      variables,
    });

    const handler = this._vm.run(codeToRun);
    await handler(variables, {
      vmEnv: this._env,
      vmLineStarted: onLineStarted,
    });
  }

  setEnv(env: Record<string, string | undefined>): void {
    Object.assign(this._env, env);
  }
}
