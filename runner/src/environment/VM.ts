import assert from "assert";
import axios from "axios";
import Debug from "debug";
import faker from "faker";
import { devices } from "playwright";
import { assertText } from "qawolf";
import { NodeVM } from "vm2";

import { GetInbox, getInbox } from "../services/inbox";
import { Logger } from "../services/Logger";
import { launch, LaunchOptions, LaunchResult } from "./launch";
import { TransformCode, transformCode } from "./transformCode";

const debug = Debug("qawolf:VM");

type VMOptions = {
  display?: string;
  logger: Logger;
  onLaunch: (launched: LaunchResult) => void | Promise<void>;
};

export type RunOptions = TransformCode & {
  onLineStarted: (line: number) => boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatMessage = (args: any[]): string => {
  return args
    .map((arg) => {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return arg;
      }
    })
    .join(" ");
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
      faker,
      getInbox: (options: GetInbox) => {
        const context = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          apiKey: this._env.QAWOLF_TEAM_API_KEY!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          inbox: this._env.QAWOLF_TEAM_INBOX!,
        };

        debug(
          `sandbox getInbox ${JSON.stringify(options)} ${JSON.stringify(
            context
          )}`
        );
        return getInbox(options, context);
      },
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
    debug(
      `set env: assign ${JSON.stringify(env)} to ${JSON.stringify(this._env)}`
    );
    Object.assign(this._env, env);
  }
}
