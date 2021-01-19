import { LaunchResult } from "../../src/environment/launch";
import { VM } from "../../src/environment/VM";
import { Logger } from "../../src/services/Logger";

const runOptions = {
  code: "",
  helpers: "",
  onLineStarted: () => {
    // do nothing
  },
  variables: {},
};

describe("VM", () => {
  let launched: LaunchResult;
  const logger = new Logger();
  let vm: VM;

  beforeAll(() => {
    vm = new VM({
      logger,
      onLaunch: (result) => {
        launched = result;
      },
    });
  });

  describe("callbacks", () => {
    it("calls onLaunch", async () => {
      await vm.run({
        ...runOptions,
        code: "await launch()",
      });

      expect(!!launched.browser).toBe(true);
      await launched.browser.close();
    });

    it("calls onLineStarted", () => {
      const lines: number[] = [];

      vm.run({
        ...runOptions,
        onLineStarted: (line) => {
          lines.push(line);
        },
        code: "const a = '1';\nconst b = '2';\n",
      });

      expect(lines).toEqual([1, 2]);
    });
  });

  describe("run", () => {
    it("intercepts console logs", async () => {
      vm.run({
        ...runOptions,
        code: "console.log('hello')",
      });

      expect(
        logger.logs.filter((l) => l.message.includes("CONSOLE: hello"))
      ).toMatchObject([{ message: "CONSOLE: hello", severity: "info" }]);
    });

    it("intercepts console logs with arguments", async () => {
      vm.run({
        ...runOptions,
        code: "const a = 'world'; console.log('hello', a)",
      });

      expect(
        logger.logs.filter((l) => l.message.includes("world"))
      ).toMatchObject([{ message: "CONSOLE: hello world", severity: "info" }]);
    });

    it("passes through variables", async () => {
      await vm.run({
        ...runOptions,
        code: "console.log(myVar)",
        variables: { myVar: "MY_VAR" },
      });

      expect(
        logger.logs.filter((l) => l.message.includes("MY_VAR"))
      ).toMatchObject([{ message: "CONSOLE: MY_VAR", severity: "info" }]);
    });
  });

  describe("setEnv", () => {
    it("sets the environment variables", async () => {
      vm.setEnv({ ONE: "SET_ENV_ONE" });

      await vm.run({
        ...runOptions,
        code: "console.log(process.env.ONE)",
      });

      expect(
        logger.logs.filter((l) => l.message.includes("SET_ENV_ONE"))
      ).toMatchObject([{ message: "CONSOLE: SET_ENV_ONE", severity: "info" }]);
    });
  });
});
